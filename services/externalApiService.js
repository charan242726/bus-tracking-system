const axios = require('axios');
const BusStop = require('../models/BusStop');

class ExternalApiService {
  constructor() {
    // API Keys would be stored in environment variables
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.openStreetMapUrl = 'https://overpass-api.de/api/interpreter';
  }

  // Import bus stops from Google Places API
  async importFromGooglePlaces(lat, lng, radius = 5000) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const params = {
        location: `${lat},${lng}`,
        radius: radius,
        type: 'bus_station',
        key: this.googleMapsApiKey
      };

      const response = await axios.get(url, { params });
      const places = response.data.results;

      const importedStops = [];

      for (const place of places) {
        const busStop = {
          stopId: `google_${place.place_id}`,
          name: place.name,
          description: place.vicinity,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          address: {
            street: place.vicinity,
            city: 'Unknown', // Would need Geocoding API for detailed address
            state: 'Unknown',
            country: 'US'
          },
          externalData: {
            googlePlaceId: place.place_id,
            lastUpdated: new Date()
          },
          amenities: {
            hasSeating: false, // Default values, would need additional API calls
            hasShelter: false,
            isWheelchairAccessible: false,
            hasRealTimeDisplay: false
          }
        };

        // Check if bus stop already exists
        const existingStop = await BusStop.findOne({ stopId: busStop.stopId });
        if (!existingStop) {
          const newStop = new BusStop(busStop);
          await newStop.save();
          importedStops.push(newStop);
        }
      }

      return {
        source: 'Google Places API',
        imported: importedStops.length,
        total: places.length,
        busStops: importedStops
      };
    } catch (error) {
      throw new Error(`Google Places API import failed: ${error.message}`);
    }
  }

  // Import bus stops from OpenStreetMap using Overpass API
  async importFromOpenStreetMap(lat, lng, radius = 5000) {
    try {
      // Overpass query to find bus stops within radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["public_transport"="stop_position"]["bus"="yes"](around:${radius},${lat},${lng});
          node["highway"="bus_stop"](around:${radius},${lat},${lng});
        );
        out body;
      `;

      const response = await axios.post(this.openStreetMapUrl, overpassQuery, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const elements = response.data.elements;
      const importedStops = [];

      for (const element of elements) {
        if (element.type === 'node' && element.tags) {
          const busStop = {
            stopId: `osm_${element.id}`,
            name: element.tags.name || element.tags.ref || 'Unnamed Bus Stop',
            description: element.tags.description || '',
            location: {
              lat: element.lat,
              lng: element.lon
            },
            address: {
              street: element.tags['addr:street'] || '',
              city: element.tags['addr:city'] || '',
              state: element.tags['addr:state'] || '',
              zipCode: element.tags['addr:postcode'] || '',
              country: element.tags['addr:country'] || 'US'
            },
            externalData: {
              osmId: element.id.toString(),
              lastUpdated: new Date()
            },
            amenities: {
              hasSeating: element.tags.bench === 'yes',
              hasShelter: element.tags.shelter === 'yes',
              isWheelchairAccessible: element.tags.wheelchair === 'yes',
              hasRealTimeDisplay: false
            }
          };

          // Check if bus stop already exists
          const existingStop = await BusStop.findOne({ stopId: busStop.stopId });
          if (!existingStop) {
            const newStop = new BusStop(busStop);
            await newStop.save();
            importedStops.push(newStop);
          }
        }
      }

      return {
        source: 'OpenStreetMap',
        imported: importedStops.length,
        total: elements.length,
        busStops: importedStops
      };
    } catch (error) {
      throw new Error(`OpenStreetMap import failed: ${error.message}`);
    }
  }

  // Generic import function that can use multiple sources
  async importBusStops(lat, lng, radius = 5000, sources = ['osm']) {
    const results = {};

    try {
      if (sources.includes('google') && this.googleMapsApiKey) {
        results.google = await this.importFromGooglePlaces(lat, lng, radius);
      }

      if (sources.includes('osm')) {
        results.osm = await this.importFromOpenStreetMap(lat, lng, radius);
      }

      // Calculate totals
      const totalImported = Object.values(results).reduce((sum, result) => sum + result.imported, 0);
      const totalFound = Object.values(results).reduce((sum, result) => sum + result.total, 0);

      return {
        success: true,
        location: { lat, lng, radius },
        sources: sources,
        totalImported,
        totalFound,
        results
      };
    } catch (error) {
      throw new Error(`Bus stop import failed: ${error.message}`);
    }
  }

  // Get directions from external mapping API
  async getDirectionsFromAPI(origin, destination, mode = 'transit', options = {}) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured for directions');
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: mode,
        key: this.googleMapsApiKey,
        alternatives: options.alternatives || true,
        avoid: options.avoid || '', // tolls, highways, ferries, indoor
        departure_time: options.departureTime || 'now',
        transit_mode: options.transitMode || 'bus', // bus, subway, train, tram, rail
        transit_routing_preference: options.transitPreference || 'less_walking'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status !== 'OK') {
        throw new Error(`Directions API error: ${response.data.status}`);
      }

      return this.processDirectionsResponse(response.data);
    } catch (error) {
      throw new Error(`Directions API failed: ${error.message}`);
    }
  }

  // Process Google Directions API response
  processDirectionsResponse(data) {
    const routes = data.routes.map(route => ({
      summary: route.summary,
      distance: route.legs[0]?.distance,
      duration: route.legs[0]?.duration,
      startAddress: route.legs[0]?.start_address,
      endAddress: route.legs[0]?.end_address,
      steps: route.legs[0]?.steps?.map(step => ({
        instruction: step.html_instructions?.replace(/<[^>]*>/g, ''), // Remove HTML tags
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location,
        travelMode: step.travel_mode,
        transitDetails: step.transit_details ? {
          line: step.transit_details.line,
          departureStop: step.transit_details.departure_stop,
          arrivalStop: step.transit_details.arrival_stop,
          departureTime: step.transit_details.departure_time,
          arrivalTime: step.transit_details.arrival_time
        } : null
      })),
      polyline: route.overview_polyline?.points
    }));

    return {
      status: data.status,
      routes,
      geocodedWaypoints: data.geocoded_waypoints
    };
  }

  // Get optimized route for multiple waypoints
  async getOptimizedRoute(origin, destination, waypoints = []) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured for route optimization');
      }

      const waypointsStr = waypoints.length > 0 ? 
        'optimize:true|' + waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|') : '';

      const url = `https://maps.googleapis.com/maps/api/directions/json`;
      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        waypoints: waypointsStr,
        key: this.googleMapsApiKey
      };

      const response = await axios.get(url, { params });
      return this.processDirectionsResponse(response.data);
    } catch (error) {
      throw new Error(`Route optimization failed: ${error.message}`);
    }
  }

  // Get real-time traffic information
  async getTrafficInfo(route) {
    try {
      // This would use Google Maps Traffic API or similar
      // For now, return mock data
      return {
        currentTraffic: 'moderate',
        delayMinutes: Math.floor(Math.random() * 15),
        alternativeRoutes: 2,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Traffic info failed: ${error.message}`);
    }
  }

  // Generate static map URL for visualization
  generateStaticMapUrl(options) {
    if (!this.googleMapsApiKey) {
      return null;
    }

    const {
      center,
      zoom = 13,
      size = '600x400',
      markers = [],
      path = null,
      mapType = 'roadmap'
    } = options;

    let url = `https://maps.googleapis.com/maps/api/staticmap?`;
    
    // Add center and zoom
    if (center) {
      url += `center=${center.lat},${center.lng}&zoom=${zoom}&`;
    }
    
    url += `size=${size}&maptype=${mapType}&`;
    
    // Add markers
    markers.forEach((marker, index) => {
      const color = marker.color || (index === 0 ? 'green' : index === markers.length - 1 ? 'red' : 'blue');
      const label = marker.label || String.fromCharCode(65 + index); // A, B, C...
      url += `markers=color:${color}|label:${label}|${marker.lat},${marker.lng}&`;
    });
    
    // Add path/polyline
    if (path) {
      url += `path=color:0x0000ff|weight:5|enc:${path}&`;
    }
    
    url += `key=${this.googleMapsApiKey}`;
    
    return url;
  }

  // Validate coordinates
  isValidCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }
}

module.exports = new ExternalApiService();
