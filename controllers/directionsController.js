const BusStop = require('../models/BusStop');
const Route = require('../models/Route');
const User = require('../models/User');

class DirectionsController {
  // Get directions between two points
  async getDirections(req, res) {
    try {
      const { origin, destination, mode = 'transit' } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({
          success: false,
          message: 'Origin and destination coordinates are required'
        });
      }

      // Validate coordinates
      if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
        return res.status(400).json({
          success: false,
          message: 'Both origin and destination must have lat and lng coordinates'
        });
      }

      // Placeholder for external API integration (Google Maps Directions API, OpenRouteService, etc.)
      const mockDirections = {
        origin: origin,
        destination: destination,
        mode: mode,
        distance: this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng),
        estimatedTime: Math.round(this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 2), // rough estimate: 2 minutes per km
        routes: [{
          summary: 'Main Route',
          legs: [{
            distance: {
              text: `${Math.round(this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 1000)}m`,
              value: Math.round(this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 1000)
            },
            duration: {
              text: `${Math.round(this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 2)} mins`,
              value: Math.round(this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 2) * 60
            },
            start_location: origin,
            end_location: destination,
            steps: [{
              html_instructions: 'Walk to the nearest bus stop',
              distance: { text: '200m', value: 200 },
              duration: { text: '3 mins', value: 180 },
              start_location: origin,
              end_location: { lat: origin.lat + 0.001, lng: origin.lng + 0.001 }
            }]
          }]
        }],
        note: 'This is a mock response. Implement external mapping API integration for real directions.'
      };

      res.json({
        success: true,
        data: mockDirections,
        message: 'Directions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting directions',
        error: error.message
      });
    }
  }

  // Get directions to nearest bus stop
  async getDirectionsToNearestBusStop(req, res) {
    try {
      const { lat, lng, maxRadius = 1000 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'User location coordinates (lat, lng) are required'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radius = parseInt(maxRadius);

      // Find nearby bus stops
      const nearbyStops = await BusStop.findNearby(latitude, longitude, radius);

      if (nearbyStops.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No bus stops found within ${radius}m`
        });
      }

      // Get the closest bus stop
      const closestStop = nearbyStops.reduce((closest, stop) => {
        const distance = stop.distanceTo(latitude, longitude);
        const closestDistance = closest.distanceTo(latitude, longitude);
        return distance < closestDistance ? stop : closest;
      });

      // Generate directions to the closest stop
      const directions = {
        origin: { lat: latitude, lng: longitude },
        destination: closestStop.location,
        busStop: {
          id: closestStop._id,
          stopId: closestStop.stopId,
          name: closestStop.name,
          location: closestStop.location,
          distance: Math.round(closestStop.distanceTo(latitude, longitude) * 1000), // meters
          routes: closestStop.routes
        },
        walkingDirections: {
          distance: Math.round(closestStop.distanceTo(latitude, longitude) * 1000),
          estimatedWalkingTime: Math.round(closestStop.distanceTo(latitude, longitude) * 12), // ~12 minutes per km walking
          instructions: [
            `Head towards ${closestStop.name}`,
            `Walk approximately ${Math.round(closestStop.distanceTo(latitude, longitude) * 1000)}m`,
            `Arrive at bus stop: ${closestStop.name}`
          ]
        },
        note: 'Implement external mapping API for detailed walking directions'
      };

      res.json({
        success: true,
        data: directions,
        message: `Directions to nearest bus stop: ${closestStop.name}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting directions to nearest bus stop',
        error: error.message
      });
    }
  }

  // Get route planning between bus stops
  async getRoutePlan(req, res) {
    try {
      const { startStopId, endStopId } = req.body;

      if (!startStopId || !endStopId) {
        return res.status(400).json({
          success: false,
          message: 'Start and end bus stop IDs are required'
        });
      }

      // Find the bus stops
      const startStop = await BusStop.findOne({
        $or: [{ _id: startStopId }, { stopId: startStopId }]
      }).populate('routes.routeId', 'routeName routeId stops startLocation endLocation');

      const endStop = await BusStop.findOne({
        $or: [{ _id: endStopId }, { stopId: endStopId }]
      }).populate('routes.routeId', 'routeName routeId stops startLocation endLocation');

      if (!startStop || !endStop) {
        return res.status(404).json({
          success: false,
          message: 'One or both bus stops not found'
        });
      }

      // Find common routes
      const commonRoutes = startStop.routes.filter(startRoute =>
        endStop.routes.some(endRoute =>
          endRoute.routeId._id.toString() === startRoute.routeId._id.toString()
        )
      );

      let routePlan = {
        startStop: {
          id: startStop._id,
          stopId: startStop.stopId,
          name: startStop.name,
          location: startStop.location
        },
        endStop: {
          id: endStop._id,
          stopId: endStop.stopId,
          name: endStop.name,
          location: endStop.location
        },
        distance: Math.round(startStop.distanceTo(endStop.location.lat, endStop.location.lng) * 1000),
        directRoutes: [],
        transferRoutes: [],
        estimatedTime: null
      };

      if (commonRoutes.length > 0) {
        // Direct routes available
        routePlan.directRoutes = commonRoutes.map(route => ({
          routeId: route.routeId._id,
          routeName: route.routeId.routeName,
          startSequence: route.sequence,
          endSequence: endStop.routes.find(r => 
            r.routeId._id.toString() === route.routeId._id.toString()
          ).sequence,
          estimatedTime: Math.round(startStop.distanceTo(endStop.location.lat, endStop.location.lng) * 3) // ~3 minutes per km by bus
        }));
        
        routePlan.estimatedTime = Math.min(...routePlan.directRoutes.map(r => r.estimatedTime));
      } else {
        // Need transfers - simplified logic for now
        routePlan.transferRoutes.push({
          message: 'Transfer required - implement advanced route planning algorithm',
          suggestion: 'Consider using external routing APIs for complex multi-leg journeys'
        });
        routePlan.estimatedTime = Math.round(startStop.distanceTo(endStop.location.lat, endStop.location.lng) * 5); // longer estimate for transfers
      }

      res.json({
        success: true,
        data: routePlan,
        message: commonRoutes.length > 0 ? 
          `Found ${commonRoutes.length} direct route(s)` : 
          'Transfer required between these stops'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error planning route',
        error: error.message
      });
    }
  }

  // Get directions for a specific route
  async getRouteDirections(req, res) {
    try {
      const { routeId } = req.params;

      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      // Get all bus stops for this route
      const routeStops = await BusStop.find({
        'routes.routeId': routeId
      }).sort({ 'routes.sequence': 1 });

      const routeDirections = {
        routeId: route._id,
        routeName: route.routeName,
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        totalDistance: 0,
        estimatedTotalTime: 0,
        stops: routeStops.map(stop => {
          const routeInfo = stop.routes.find(r => r.routeId.toString() === routeId);
          return {
            id: stop._id,
            stopId: stop.stopId,
            name: stop.name,
            location: stop.location,
            sequence: routeInfo ? routeInfo.sequence : 0,
            amenities: stop.amenities
          };
        }).sort((a, b) => a.sequence - b.sequence),
        segments: []
      };

      // Calculate segments between consecutive stops
      for (let i = 0; i < routeDirections.stops.length - 1; i++) {
        const currentStop = routeDirections.stops[i];
        const nextStop = routeDirections.stops[i + 1];
        
        const distance = this.calculateDistance(
          currentStop.location.lat,
          currentStop.location.lng,
          nextStop.location.lat,
          nextStop.location.lng
        );

        const segment = {
          from: currentStop.name,
          to: nextStop.name,
          distance: Math.round(distance * 1000), // meters
          estimatedTime: Math.round(distance * 2) // ~2 minutes per km
        };

        routeDirections.segments.push(segment);
        routeDirections.totalDistance += segment.distance;
        routeDirections.estimatedTotalTime += segment.estimatedTime;
      }

      res.json({
        success: true,
        data: routeDirections,
        message: 'Route directions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting route directions',
        error: error.message
      });
    }
  }

  // Utility method to calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get smart journey recommendations
  async getSmartJourneyRecommendations(req, res) {
    try {
      const { userId, destination } = req.body;

      if (!userId || !destination) {
        return res.status(400).json({
          success: false,
          message: 'User ID and destination coordinates are required'
        });
      }

      // Get user information
      const user = await User.findOne({
        $or: [{ _id: userId }, { userId: userId }]
      }).populate('preferences.favoriteRoutes.routeId')
        .populate('preferences.favoriteBusStops.stopId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.currentLocation || !user.currentLocation.lat || !user.currentLocation.lng) {
        return res.status(400).json({
          success: false,
          message: 'User location not available'
        });
      }

      // Find nearby bus stops to user's current location
      const nearbyStops = await BusStop.findNearby(
        user.currentLocation.lat,
        user.currentLocation.lng,
        1000
      );

      // Find nearby bus stops to destination
      const destinationStops = await BusStop.findNearby(
        destination.lat,
        destination.lng,
        1000
      );

      const recommendations = {
        userLocation: user.currentLocation,
        destination: destination,
        nearbyStops: nearbyStops.slice(0, 5), // Top 5 closest stops
        destinationStops: destinationStops.slice(0, 5),
        favoriteRoutes: user.preferences?.favoriteRoutes || [],
        favoriteBusStops: user.preferences?.favoriteBusStops || [],
        smartRecommendations: [
          {
            type: 'closest_stop',
            message: 'Walk to the nearest bus stop',
            action: nearbyStops.length > 0 ? `Go to ${nearbyStops[0].name}` : 'No nearby stops found'
          },
          {
            type: 'favorite_routes',
            message: 'Consider using your favorite routes',
            routes: user.preferences?.favoriteRoutes || []
          }
        ],
        note: 'Implement AI-based journey recommendations based on user history and real-time data'
      };

      res.json({
        success: true,
        data: recommendations,
        message: 'Smart journey recommendations generated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating smart recommendations',
        error: error.message
      });
    }
  }
}

module.exports = new DirectionsController();
