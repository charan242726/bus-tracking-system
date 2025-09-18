const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const User = require('../models/User');
const BusStop = require('../models/BusStop');
const City = require('../models/City');

class BusTrackingController {
  // Find available buses between cities
  async findAvailableBuses(req, res) {
    try {
      const { originCity, destinationCity, departureTime, routeType } = req.query;

      if (!originCity || !destinationCity) {
        return res.status(400).json({
          success: false,
          message: 'Origin and destination cities are required'
        });
      }

      // Find cities
      const [originCities, destinationCities] = await Promise.all([
        City.findByName(originCity, 3),
        City.findByName(destinationCity, 3)
      ]);

      if (originCities.length === 0 || destinationCities.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'One or both cities not found'
        });
      }

      // Find routes between these cities
      const routes = [];
      for (const origin of originCities) {
        for (const destination of destinationCities) {
          const cityRoutes = await Route.findBetweenCities(origin._id, destination._id);
          routes.push(...cityRoutes);
        }
      }

      // Filter by route type if specified
      const filteredRoutes = routeType ? 
        routes.filter(route => route.routeType === routeType) : 
        routes;

      // Find buses currently running on these routes
      const availableBuses = [];
      for (const route of filteredRoutes) {
        const buses = await Bus.find({
          routeId: route._id,
          'currentStatus.status': { $in: ['running', 'stopped'] },
          isActive: true,
          isOnline: true
        })
        .populate('driverId', 'name contactInfo performance')
        .populate('routeId', 'routeName routeType schedule fare');

        // Add route information and next departure
        const busesWithInfo = buses.map(bus => {
          const nextDeparture = route.getNextDeparture();
          const occupancyPercentage = bus.getOccupancyPercentage();
          
          return {
            ...bus.toObject(),
            routeInfo: {
              routeName: route.routeName,
              routeType: route.routeType,
              totalDistance: route.routeInfo.totalDistance,
              estimatedTravelTime: route.routeInfo.estimatedTravelTime,
              baseFare: route.fare.baseFare
            },
            nextDeparture,
            occupancyPercentage,
            isAvailable: occupancyPercentage < 90 // Consider available if less than 90% full
          };
        });

        availableBuses.push(...busesWithInfo);
      }

      // Sort by departure time and availability
      const sortedBuses = availableBuses.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return 0;
      });

      res.json({
        success: true,
        data: {
          searchCriteria: {
            origin: originCity,
            destination: destinationCity,
            departureTime,
            routeType
          },
          availableBuses: sortedBuses,
          totalRoutes: filteredRoutes.length,
          totalBuses: sortedBuses.length,
          availableBuses: sortedBuses.filter(bus => bus.isAvailable).length
        },
        message: `Found ${sortedBuses.length} buses on ${filteredRoutes.length} routes`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding available buses',
        error: error.message
      });
    }
  }

  // Get real-time bus location and status
  async getBusRealTimeInfo(req, res) {
    try {
      const { busId } = req.params;

      const bus = await Bus.findOne({
        $or: [{ _id: busId }, { busId: busId }]
      })
      .populate('routeId', 'routeName stops segments')
      .populate('driverId', 'name contactInfo currentLocation')
      .populate('currentStatus.nextStopId', 'name location')
      .populate('currentStatus.lastStopId', 'name location');

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found'
        });
      }

      // Calculate ETA to next stop
      let etaToNextStop = null;
      if (bus.currentStatus.nextStopId && bus.currentLocation.speed) {
        const nextStop = bus.currentStatus.nextStopId;
        const distance = this.calculateDistance(
          bus.currentLocation.lat,
          bus.currentLocation.lng,
          nextStop.location.lat,
          nextStop.location.lng
        );
        etaToNextStop = Math.round((distance / (bus.currentLocation.speed / 60)) * 60); // minutes
      }

      // Find nearby bus stops
      const nearbyStops = await BusStop.findNearby(
        bus.currentLocation.lat,
        bus.currentLocation.lng,
        2000 // 2km radius
      );

      res.json({
        success: true,
        data: {
          bus: {
            ...bus.toObject(),
            etaToNextStop,
            occupancyPercentage: bus.getOccupancyPercentage()
          },
          nearbyBusStops: nearbyStops.slice(0, 5), // Top 5 closest
          lastUpdated: bus.currentLocation.timestamp
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting bus real-time info',
        error: error.message
      });
    }
  }

  // Track user and find optimal bus routes
  async findOptimalRoute(req, res) {
    try {
      const { userId, destination, preferences = {} } = req.body;

      if (!userId || !destination) {
        return res.status(400).json({
          success: false,
          message: 'User ID and destination coordinates are required'
        });
      }

      // Get user information
      const user = await User.findOne({
        $or: [{ _id: userId }, { userId: userId }]
      });

      if (!user || !user.currentLocation) {
        return res.status(404).json({
          success: false,
          message: 'User not found or location not available'
        });
      }

      // Find nearby buses
      const nearbyBuses = await Bus.findNearby(
        user.currentLocation.lat,
        user.currentLocation.lng,
        5000 // 5km radius
      );

      // Find buses heading towards destination
      const optimalRoutes = [];
      for (const bus of nearbyBuses) {
        const route = bus.routeId;
        if (!route) continue;

        // Calculate if this route goes towards the destination
        const routeEndDistance = this.calculateDistance(
          route.endLocation.lat,
          route.endLocation.lng,
          destination.lat,
          destination.lng
        );

        // Find the closest bus stop to user
        const nearbyStops = await BusStop.findNearby(
          user.currentLocation.lat,
          user.currentLocation.lng,
          1000 // 1km radius
        );

        const routeStops = nearbyStops.filter(stop => 
          stop.routes.some(r => r.routeId.toString() === route._id.toString())
        );

        if (routeStops.length > 0) {
          const closestStop = routeStops[0];
          const walkingDistance = closestStop.distanceTo(
            user.currentLocation.lat,
            user.currentLocation.lng
          );

          // Calculate total travel time
          const walkingTime = walkingDistance * 12; // 12 minutes per km walking
          const busTime = route.routeInfo.estimatedTravelTime || 60;
          const totalTime = walkingTime + busTime;

          optimalRoutes.push({
            bus,
            route,
            walkingInfo: {
              toStop: closestStop,
              distance: Math.round(walkingDistance * 1000), // meters
              time: Math.round(walkingTime) // minutes
            },
            totalEstimatedTime: Math.round(totalTime),
            routeEndDistance: Math.round(routeEndDistance * 1000), // meters
            occupancyPercentage: bus.getOccupancyPercentage(),
            nextDeparture: route.getNextDeparture()
          });
        }
      }

      // Sort by total time and occupancy
      const sortedRoutes = optimalRoutes.sort((a, b) => {
        // Prefer less crowded buses
        if (a.occupancyPercentage < 70 && b.occupancyPercentage >= 70) return -1;
        if (a.occupancyPercentage >= 70 && b.occupancyPercentage < 70) return 1;
        
        // Then sort by total time
        return a.totalEstimatedTime - b.totalEstimatedTime;
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            location: user.currentLocation
          },
          destination,
          optimalRoutes: sortedRoutes.slice(0, 5), // Top 5 recommendations
          totalOptions: sortedRoutes.length
        },
        message: `Found ${sortedRoutes.length} optimal route options`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding optimal route',
        error: error.message
      });
    }
  }

  // Update bus and driver location (from driver app)
  async updateBusLocation(req, res) {
    try {
      const { busId, lat, lng, speed, heading, accuracy, passengerCount } = req.body;

      if (!busId || lat == null || lng == null) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID, latitude, and longitude are required'
        });
      }

      // Find and update bus
      const bus = await Bus.findOne({
        $or: [{ _id: busId }, { busId: busId }]
      }).populate('driverId routeId');

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found'
        });
      }

      // Update bus location
      await bus.updateLocation(lat, lng, { speed, heading, accuracy });

      // Update passenger count if provided
      if (passengerCount !== undefined) {
        await bus.updatePassengerCount(passengerCount);
      }

      // Update driver location if driver is assigned
      if (bus.driverId) {
        await bus.driverId.updateLocation(lat, lng, { speed, heading, accuracy });
      }

      // Emit real-time update via Socket.io
      const io = req.app.get('io');
      if (io) {
        // Emit to specific bus room
        io.to(`bus_${bus.busId}`).emit('locationUpdate', {
          busId: bus.busId,
          location: bus.currentLocation,
          status: bus.currentStatus.status,
          occupancyPercentage: bus.getOccupancyPercentage(),
          timestamp: new Date()
        });

        // Emit general bus location update
        io.emit('busLocationUpdate', {
          busId: bus.busId,
          location: bus.currentLocation,
          routeId: bus.routeId._id,
          routeName: bus.routeId.routeName
        });
      }

      res.json({
        success: true,
        data: {
          busId: bus.busId,
          location: bus.currentLocation,
          status: bus.currentStatus.status,
          occupancyPercentage: bus.getOccupancyPercentage()
        },
        message: 'Bus location updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating bus location',
        error: error.message
      });
    }
  }

  // Get all buses on a specific route with their real-time status
  async getBusesOnRoute(req, res) {
    try {
      const { routeId } = req.params;

      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      const buses = await Bus.find({
        routeId: routeId,
        isActive: true
      })
      .populate('driverId', 'name contactInfo performance')
      .populate('currentStatus.nextStopId', 'name location')
      .sort({ 'currentTrip.routeProgress': -1 });

      const busesWithInfo = buses.map(bus => ({
        ...bus.toObject(),
        occupancyPercentage: bus.getOccupancyPercentage(),
        lastUpdate: bus.currentLocation.timestamp
      }));

      res.json({
        success: true,
        data: {
          route: {
            id: route._id,
            routeName: route.routeName,
            routeType: route.routeType,
            totalDistance: route.routeInfo.totalDistance
          },
          buses: busesWithInfo,
          totalBuses: busesWithInfo.length,
          activeBuses: busesWithInfo.filter(bus => bus.isOnline).length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting buses on route',
        error: error.message
      });
    }
  }

  // Utility method to calculate distance
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
}

module.exports = new BusTrackingController();
