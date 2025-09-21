const axios = require('axios');
const geolib = require('geolib');

class LocationService {
    constructor() {
        // Free APIs configuration
        this.nominatimURL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
        this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
        this.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
        this.locationIQToken = process.env.LOCATIONIQ_ACCESS_TOKEN;
        
        // OpenStreetMap Overpass API for real bus stop data
        this.overpassURL = 'https://overpass-api.de/api/interpreter';
        
        // Rate limiting for free services
        this.lastRequestTime = 0;
        this.requestDelay = 1000; // 1 second between requests for Nominatim
        
        // Cache for bus stop data
        this.busStopCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Rate limiting helper
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.requestDelay) {
            await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }

    // Geocoding: Convert address to coordinates
    async geocodeAddress(address, city = '', country = 'India') {
        try {
            // Try LocationIQ first (higher rate limit)
            if (this.locationIQToken) {
                return await this.geocodeWithLocationIQ(address, city, country);
            }
            
            // Fallback to Nominatim (free but lower rate limit)
            return await this.geocodeWithNominatim(address, city, country);
        } catch (error) {
            console.error('Geocoding error:', error);
            return { success: false, message: 'Geocoding failed' };
        }
    }

    async geocodeWithLocationIQ(address, city, country) {
        try {
            const query = `${address}, ${city}, ${country}`.replace(/,\s*$/, '');
            const response = await axios.get('https://eu1.locationiq.com/v1/search.php', {
                params: {
                    key: this.locationIQToken,
                    q: query,
                    format: 'json',
                    limit: 5,
                    countrycodes: 'in'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    success: true,
                    data: {
                        latitude: parseFloat(result.lat),
                        longitude: parseFloat(result.lon),
                        address: result.display_name,
                        place_id: result.place_id
                    }
                };
            } else {
                return { success: false, message: 'Address not found' };
            }
        } catch (error) {
            console.error('LocationIQ geocoding error:', error);
            throw error;
        }
    }

    async geocodeWithNominatim(address, city, country) {
        await this.respectRateLimit();
        
        try {
            const query = `${address}, ${city}, ${country}`.replace(/,\s*$/, '');
            const response = await axios.get(`${this.nominatimURL}/search`, {
                params: {
                    q: query,
                    format: 'json',
                    limit: 5,
                    countrycodes: 'in',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'BusTrackingSystem/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    success: true,
                    data: {
                        latitude: parseFloat(result.lat),
                        longitude: parseFloat(result.lon),
                        address: result.display_name,
                        place_id: result.place_id
                    }
                };
            } else {
                return { success: false, message: 'Address not found' };
            }
        } catch (error) {
            console.error('Nominatim geocoding error:', error);
            throw error;
        }
    }

    // Reverse Geocoding: Convert coordinates to address
    async reverseGeocode(latitude, longitude) {
        try {
            if (this.locationIQToken) {
                return await this.reverseGeocodeWithLocationIQ(latitude, longitude);
            }
            
            return await this.reverseGeocodeWithNominatim(latitude, longitude);
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return { success: false, message: 'Reverse geocoding failed' };
        }
    }

    async reverseGeocodeWithLocationIQ(latitude, longitude) {
        try {
            const response = await axios.get('https://eu1.locationiq.com/v1/reverse.php', {
                params: {
                    key: this.locationIQToken,
                    lat: latitude,
                    lon: longitude,
                    format: 'json'
                }
            });

            if (response.data) {
                const result = response.data;
                return {
                    success: true,
                    data: {
                        address: result.display_name,
                        city: result.address?.city || result.address?.town || result.address?.village,
                        state: result.address?.state,
                        country: result.address?.country,
                        postcode: result.address?.postcode,
                        formatted_address: result.display_name
                    }
                };
            } else {
                return { success: false, message: 'Location not found' };
            }
        } catch (error) {
            console.error('LocationIQ reverse geocoding error:', error);
            throw error;
        }
    }

    async reverseGeocodeWithNominatim(latitude, longitude) {
        await this.respectRateLimit();
        
        try {
            const response = await axios.get(`${this.nominatimURL}/reverse`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'BusTrackingSystem/1.0'
                }
            });

            if (response.data) {
                const result = response.data;
                return {
                    success: true,
                    data: {
                        address: result.display_name,
                        city: result.address?.city || result.address?.town || result.address?.village,
                        state: result.address?.state,
                        country: result.address?.country,
                        postcode: result.address?.postcode,
                        formatted_address: result.display_name
                    }
                };
            } else {
                return { success: false, message: 'Location not found' };
            }
        } catch (error) {
            console.error('Nominatim reverse geocoding error:', error);
            throw error;
        }
    }

    // Get route between two points
    async getRoute(startLat, startLng, endLat, endLng, mode = 'driving') {
        try {
            if (this.mapboxToken) {
                return await this.getRouteWithMapbox(startLat, startLng, endLat, endLng, mode);
            }
            
            // Fallback to OSRM (free routing service)
            return await this.getRouteWithOSRM(startLat, startLng, endLat, endLng, mode);
        } catch (error) {
            console.error('Route calculation error:', error);
            return { success: false, message: 'Route calculation failed' };
        }
    }

    async getRouteWithMapbox(startLat, startLng, endLat, endLng, mode) {
        try {
            const profile = mode === 'walking' ? 'walking' : 'driving';
            const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${startLng},${startLat};${endLng},${endLat}`, {
                params: {
                    access_token: this.mapboxToken,
                    geometries: 'geojson',
                    overview: 'full',
                    steps: true
                }
            });

            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return {
                    success: true,
                    data: {
                        distance: route.distance, // meters
                        duration: route.duration, // seconds
                        geometry: route.geometry,
                        steps: route.legs[0].steps
                    }
                };
            } else {
                return { success: false, message: 'No route found' };
            }
        } catch (error) {
            console.error('Mapbox routing error:', error);
            throw error;
        }
    }

    async getRouteWithOSRM(startLat, startLng, endLat, endLng, mode) {
        try {
            const profile = mode === 'walking' ? 'foot' : 'car';
            const response = await axios.get(`http://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}`, {
                params: {
                    overview: 'full',
                    geometries: 'geojson',
                    steps: true
                }
            });

            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return {
                    success: true,
                    data: {
                        distance: route.distance, // meters
                        duration: route.duration, // seconds
                        geometry: route.geometry,
                        steps: route.legs[0].steps
                    }
                };
            } else {
                return { success: false, message: 'No route found' };
            }
        } catch (error) {
            console.error('OSRM routing error:', error);
            throw error;
        }
    }

    // Calculate distance between two points
    calculateDistance(lat1, lng1, lat2, lng2) {
        return geolib.getDistance(
            { latitude: lat1, longitude: lng1 },
            { latitude: lat2, longitude: lng2 }
        );
    }

    // Find nearby bus stops
    findNearbyStops(userLat, userLng, busStops, radiusInMeters = 1000) {
        return busStops
            .map(stop => {
                const distance = this.calculateDistance(userLat, userLng, stop.location.latitude, stop.location.longitude);
                return {
                    ...stop,
                    distance
                };
            })
            .filter(stop => stop.distance <= radiusInMeters)
            .sort((a, b) => a.distance - b.distance);
    }

    // Validate coordinates
    isValidCoordinates(latitude, longitude) {
        return (
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        );
    }

    // Search places (for autocomplete)
    async searchPlaces(query, city = '', limit = 5) {
        try {
            if (this.locationIQToken) {
                return await this.searchPlacesWithLocationIQ(query, city, limit);
            }
            
            return await this.searchPlacesWithNominatim(query, city, limit);
        } catch (error) {
            console.error('Place search error:', error);
            return { success: false, message: 'Place search failed' };
        }
    }

    async searchPlacesWithLocationIQ(query, city, limit) {
        try {
            const searchQuery = city ? `${query}, ${city}` : query;
            const response = await axios.get('https://eu1.locationiq.com/v1/search.php', {
                params: {
                    key: this.locationIQToken,
                    q: searchQuery,
                    format: 'json',
                    limit: limit,
                    countrycodes: 'in'
                }
            });

            if (response.data && response.data.length > 0) {
                return {
                    success: true,
                    data: response.data.map(place => ({
                        name: place.display_name,
                        latitude: parseFloat(place.lat),
                        longitude: parseFloat(place.lon),
                        type: place.type,
                        place_id: place.place_id
                    }))
                };
            } else {
                return { success: false, message: 'No places found' };
            }
        } catch (error) {
            console.error('LocationIQ search error:', error);
            throw error;
        }
    }

    async searchPlacesWithNominatim(query, city, limit) {
        await this.respectRateLimit();
        
        try {
            const searchQuery = city ? `${query}, ${city}` : query;
            const response = await axios.get(`${this.nominatimURL}/search`, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: limit,
                    countrycodes: 'in',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'BusTrackingSystem/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                return {
                    success: true,
                    data: response.data.map(place => ({
                        name: place.display_name,
                        latitude: parseFloat(place.lat),
                        longitude: parseFloat(place.lon),
                        type: place.type,
                        place_id: place.place_id
                    }))
                };
            } else {
                return { success: false, message: 'No places found' };
            }
        } catch (error) {
            console.error('Nominatim search error:', error);
            throw error;
        }
    }

    // Enhanced Google Places API integration for more accurate results
    async searchPlacesWithGooglePlaces(query, city, limit) {
        if (!this.googleMapsKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const searchQuery = city ? `${query}, ${city}, India` : `${query}, India`;
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
                params: {
                    query: searchQuery,
                    key: this.googleMapsKey,
                    language: 'en',
                    region: 'in'
                }
            });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                return {
                    success: true,
                    data: response.data.results.slice(0, limit).map(place => ({
                        name: place.name,
                        formatted_address: place.formatted_address,
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        type: place.types[0],
                        place_id: place.place_id,
                        rating: place.rating,
                        photo_reference: place.photos?.[0]?.photo_reference
                    }))
                };
            } else {
                return { success: false, message: 'No places found' };
            }
        } catch (error) {
            console.error('Google Places API error:', error);
            throw error;
        }
    }

    // Import real bus stop data from OpenStreetMap using Overpass API
    async importBusStopsFromOSM(cityName, boundingBox) {
        const cacheKey = `${cityName}_${boundingBox.join('_')}`;
        
        // Check cache first
        if (this.busStopCache.has(cacheKey)) {
            const cached = this.busStopCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return { success: true, data: cached.data, source: 'cache' };
            }
        }

        try {
            // Overpass API query for bus stops within bounding box
            const overpassQuery = `
                [out:json][timeout:25];
                (
                    node["highway"="bus_stop"](${boundingBox[0]},${boundingBox[1]},${boundingBox[2]},${boundingBox[3]});
                    node["public_transport"="stop_position"](${boundingBox[0]},${boundingBox[1]},${boundingBox[2]},${boundingBox[3]});
                    node["amenity"="bus_station"](${boundingBox[0]},${boundingBox[1]},${boundingBox[2]},${boundingBox[3]});
                );
                out geom;
            `;

            const response = await axios.post(this.overpassURL, `data=${encodeURIComponent(overpassQuery)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'BusTrackingSystem/1.0'
                },
                timeout: 30000
            });

            if (response.data && response.data.elements) {
                const busStops = response.data.elements.map(element => ({
                    osm_id: element.id,
                    name: element.tags?.name || `Bus Stop ${element.id}`,
                    description: element.tags?.description || element.tags?.operator || 'Public bus stop',
                    latitude: element.lat,
                    longitude: element.lon,
                    amenity: element.tags?.amenity,
                    highway: element.tags?.highway,
                    public_transport: element.tags?.public_transport,
                    operator: element.tags?.operator,
                    network: element.tags?.network,
                    ref: element.tags?.ref,
                    shelter: element.tags?.shelter === 'yes',
                    bench: element.tags?.bench === 'yes',
                    wheelchair: element.tags?.wheelchair === 'yes'
                }));

                // Cache the results
                this.busStopCache.set(cacheKey, {
                    data: busStops,
                    timestamp: Date.now()
                });

                return {
                    success: true,
                    data: busStops,
                    source: 'osm',
                    count: busStops.length
                };
            } else {
                return { success: false, message: 'No bus stops found in the specified area' };
            }
        } catch (error) {
            console.error('Overpass API error:', error);
            return { success: false, message: 'Failed to fetch bus stops from OSM' };
        }
    }

    // Get more accurate route directions using Google Directions API
    async getRouteWithGoogleDirections(startLat, startLng, endLat, endLng, mode = 'transit') {
        if (!this.googleMapsKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
                params: {
                    origin: `${startLat},${startLng}`,
                    destination: `${endLat},${endLng}`,
                    mode: mode,
                    transit_mode: 'bus',
                    language: 'en',
                    region: 'in',
                    key: this.googleMapsKey
                }
            });

            if (response.data.status === 'OK' && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                const leg = route.legs[0];

                return {
                    success: true,
                    data: {
                        distance: leg.distance.value, // meters
                        duration: leg.duration.value, // seconds
                        distance_text: leg.distance.text,
                        duration_text: leg.duration.text,
                        start_address: leg.start_address,
                        end_address: leg.end_address,
                        steps: leg.steps.map(step => ({
                            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
                            distance: step.distance,
                            duration: step.duration,
                            travel_mode: step.travel_mode,
                            transit_details: step.transit_details
                        })),
                        polyline: route.overview_polyline.points
                    }
                };
            } else {
                return { success: false, message: 'No route found' };
            }
        } catch (error) {
            console.error('Google Directions API error:', error);
            throw error;
        }
    }

    // Generate static map images for route visualization
    async generateStaticMapImage(waypoints, size = '600x400', maptype = 'roadmap') {
        if (!this.googleMapsKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const markersParam = waypoints.map((point, index) => {
                const label = index === 0 ? 'A' : index === waypoints.length - 1 ? 'B' : String(index);
                return `markers=color:${index === 0 ? 'green' : index === waypoints.length - 1 ? 'red' : 'blue'}%7Clabel:${label}%7C${point.lat},${point.lng}`;
            }).join('&');

            const pathParam = `path=color:0x0000ff%7Cweight:3%7C${waypoints.map(p => `${p.lat},${p.lng}`).join('%7C')}`;

            const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?${markersParam}&${pathParam}&size=${size}&maptype=${maptype}&key=${this.googleMapsKey}`;

            return {
                success: true,
                data: {
                    url: mapUrl,
                    size: size,
                    waypoints_count: waypoints.length
                }
            };
        } catch (error) {
            console.error('Static Maps API error:', error);
            return { success: false, message: 'Failed to generate static map' };
        }
    }

    // Enhanced search with priority to more accurate APIs
    async searchPlacesEnhanced(query, city = '', limit = 5) {
        try {
            // Try Google Places first for best accuracy
            if (this.googleMapsKey) {
                try {
                    const googleResult = await this.searchPlacesWithGooglePlaces(query, city, limit);
                    if (googleResult.success) {
                        return { ...googleResult, source: 'google_places' };
                    }
                } catch (error) {
                    console.log('Google Places failed, falling back to other APIs');
                }
            }

            // Fallback to LocationIQ
            if (this.locationIQToken) {
                try {
                    const locationIQResult = await this.searchPlacesWithLocationIQ(query, city, limit);
                    if (locationIQResult.success) {
                        return { ...locationIQResult, source: 'locationiq' };
                    }
                } catch (error) {
                    console.log('LocationIQ failed, falling back to Nominatim');
                }
            }

            // Final fallback to Nominatim
            const nominatimResult = await this.searchPlacesWithNominatim(query, city, limit);
            return { ...nominatimResult, source: 'nominatim' };

        } catch (error) {
            console.error('Enhanced search error:', error);
            return { success: false, message: 'All location services failed' };
        }
    }

    // Clear cache when needed
    clearCache() {
        this.busStopCache.clear();
        return { success: true, message: 'Cache cleared successfully' };
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.busStopCache.size,
            entries: Array.from(this.busStopCache.keys()),
            oldest_entry: Math.min(...Array.from(this.busStopCache.values()).map(v => v.timestamp)),
            newest_entry: Math.max(...Array.from(this.busStopCache.values()).map(v => v.timestamp))
        };
    }
}

module.exports = new LocationService();
