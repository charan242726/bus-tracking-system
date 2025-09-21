const User = require('../models/User');
const BusStop = require('../models/BusStop');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const City = require('../models/City');

class EnhancedUserController {
  // Search bus stands within a city
  async searchBusStandsInCity(req, res) {
    try {
      const { cityName, userLocation, radius = 10000 } = req.query; // 10km default

      if (!cityName) {
        return res.status(400).json({
          success: false,
          message: 'City name is required'
        });
      }

      // Find the city
      const cities = await City.findByName(cityName, 3);
      if (cities.length === 0) {
        return res.status(404).json({
          success: false,
          message: `City "${cityName}" not found`
        });
      }

      const city = cities[0];

      // If user location is provided, find nearby bus stops
      let busStops;
      if (userLocation) {
        const { lat, lng } = JSON.parse(userLocation);
        busStops = await BusStop.findNearby(lat, lng, radius);
      } else {
        // Find all bus stops in the city
        busStops = await BusStop.find({
          'address.city': { $regex: cityName, $options: 'i' },
          isActive: true
        }).limit(50);
      }

      // Add distance information if user location is provided
      let busStandsWithInfo = busStops.map(stop => {
        let distance = null;
        if (userLocation) {
          const { lat, lng } = JSON.parse(userLocation);
          distance = stop.distanceTo(lat, lng) * 1000; // convert to meters
        }

        return {
          id: stop._id,
          stopId: stop.stopId,
          name: stop.name,
          location: stop.location,
          address: stop.address,
          amenities: stop.amenities,
          routes: stop.routes.length,
          distance: distance ? Math.round(distance) : null
        };
      });

      // Sort by distance if user location is provided
      if (userLocation) {
        busStandsWithInfo = busStandsWithInfo.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      res.json({
        success: true,
        data: {
          city: {
            name: city.name,
            state: city.state,
            centerLocation: city.centerLocation
          },
          busStands: busStandsWithInfo,
          totalFound: busStandsWithInfo.length,
          searchRadius: userLocation ? `${radius/1000}km` : 'city-wide'
        },
        message: `Found ${busStandsWithInfo.length} bus stands in ${cityName}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching bus stands',
        error: error.message
      });
    }
  }

  // Find buses going to a specific destination within city
  async findBusesToDestination(req, res) {
    try {
      const { fromStopId, destinationArea, cityName } = req.query;
      const user = req.authenticatedUser;

      if (!fromStopId || !destinationArea) {
        return res.status(400).json({
          success: false,
          message: 'From stop ID and destination area are required'
        });
      }

      // Find the departure bus stop
      const fromStop = await BusStop.findById(fromStopId)
        .populate('routes.routeId', 'routeName routeType stops fare');

      if (!fromStop) {
        return res.status(404).json({
          success: false,
          message: 'Departure bus stop not found'
        });
      }

      // Find bus stops near destination area
      const destinationStops = await BusStop.find({
        $or: [
          { name: { $regex: destinationArea, $options: 'i' } },
          { 'address.street': { $regex: destinationArea, $options: 'i' } },
          { description: { $regex: destinationArea, $options: 'i' } }
        ],
        isActive: true
      });

      // Find common routes between from stop and destination stops
      const availableBuses = [];
      for (const route of fromStop.routes) {
        const routeId = route.routeId._id;

        // Check if this route serves any destination stops
        const commonStops = destinationStops.filter(destStop =>
          destStop.routes.some(r => r.routeId.toString() === routeId.toString())
        );

        if (commonStops.length > 0) {
          // Find buses currently on this route
          const buses = await Bus.find({
            routeId: routeId,
            isActive: true,
            isOnline: true,
            'currentStatus.status': { $in: ['running', 'stopped'] }
          }).populate('driverId', 'name contactInfo');

          for (const bus of buses) {
            const busInfo = {
              bus: {
                busId: bus.busId,
                location: bus.currentLocation,
                status: bus.currentStatus.status,
                occupancyPercentage: bus.getOccupancyPercentage(),
                passengerCount: bus.currentStatus.currentPassengers,
                capacity: bus.busInfo?.capacity?.total || 50
              },
              route: {
                id: route.routeId._id,
                routeName: route.routeId.routeName,
                routeType: route.routeId.routeType,
                baseFare: route.routeId.fare?.baseFare || 0
              },
              driver: bus.driverId ? {
                name: bus.driverId.name,
                phone: bus.driverId.contactInfo?.phone
              } : null,
              destinationStops: commonStops.map(stop => ({
                id: stop._id,
                name: stop.name,
                location: stop.location
              })),
              estimatedTime: this.calculateJourneyTime(fromStop.location, commonStops[0].location, route.routeId.routeType),
              nextDeparture: route.routeId.getNextDeparture(),
              isAvailable: bus.getOccupancyPercentage() < 90
            };

            availableBuses.push(busInfo);
          }
        }
      }

      // Sort by availability and estimated time
      availableBuses.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.estimatedTime - b.estimatedTime;
      });

      res.json({
        success: true,
        data: {
          fromStop: {
            id: fromStop._id,
            name: fromStop.name,
            location: fromStop.location
          },
          destinationArea,
          availableBuses: availableBuses.slice(0, 10), // Top 10 results
          totalOptions: availableBuses.length
        },
        message: `Found ${availableBuses.length} buses to ${destinationArea}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding buses to destination',
        error: error.message
      });
    }
  }

  // Get real-time bus arrival predictions for a stop
  async getBusArrivals(req, res) {
    try {
      const { stopId } = req.params;

      const busStop = await BusStop.findById(stopId)
        .populate('routes.routeId', 'routeName routeType');

      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
        });
      }

      const arrivals = [];
      for (const routeInfo of busStop.routes) {
        // Find buses on this route
        const buses = await Bus.find({
          routeId: routeInfo.routeId._id,
          isActive: true,
          isOnline: true,
          'currentStatus.status': 'running'
        }).populate('driverId', 'name');

        for (const bus of buses) {
          const distance = this.calculateDistance(
            bus.currentLocation.lat,
            bus.currentLocation.lng,
            busStop.location.lat,
            busStop.location.lng
          );

          // Estimate arrival time based on distance and current speed
          let estimatedArrival = new Date();
          if (bus.currentLocation.speed && bus.currentLocation.speed > 0) {
            const timeInHours = distance / bus.currentLocation.speed;
            estimatedArrival = new Date(Date.now() + (timeInHours * 60 * 60 * 1000));
          } else {
            // Default estimate: 30km/h average speed
            const timeInHours = distance / 30;
            estimatedArrival = new Date(Date.now() + (timeInHours * 60 * 60 * 1000));
          }

          arrivals.push({
            bus: {
              busId: bus.busId,
              location: bus.currentLocation,
              occupancyPercentage: bus.getOccupancyPercentage(),
              status: bus.currentStatus.status
            },
            route: {
              routeName: routeInfo.routeId.routeName,
              routeType: routeInfo.routeId.routeType
            },
            driver: bus.driverId?.name,
            estimatedArrival,
            distance: Math.round(distance * 1000), // meters
            minutesToArrival: Math.max(1, Math.round((estimatedArrival - new Date()) / (1000 * 60)))
          });
        }
      }

      // Sort by estimated arrival time
      arrivals.sort((a, b) => a.estimatedArrival - b.estimatedArrival);

      res.json({
        success: true,
        data: {
          busStop: {
            id: busStop._id,
            name: busStop.name,
            location: busStop.location
          },
          arrivals: arrivals.slice(0, 5), // Next 5 buses
          lastUpdated: new Date()
        },
        message: `${arrivals.length} buses approaching ${busStop.name}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting bus arrivals',
        error: error.message
      });
    }
  }

  // Start a trip (user boards a bus)
  async startTrip(req, res) {
    try {
      const { busId, fromStopId, toStopId } = req.body;
      const user = req.authenticatedUser;

      if (!busId || !fromStopId || !toStopId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID, from stop ID, and to stop ID are required'
        });
      }

      // Validate bus exists and is active
      const bus = await Bus.findOne({ busId, isActive: true })
        .populate('routeId', 'routeName');

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found or inactive'
        });
      }

      // Validate bus stops
      const [fromStop, toStop] = await Promise.all([
        BusStop.findById(fromStopId),
        BusStop.findById(toStopId)
      ]);

      if (!fromStop || !toStop) {
        return res.status(404).json({
          success: false,
          message: 'One or both bus stops not found'
        });
      }

      // Update user's current trip
      user.currentTrip = {
        routeId: bus.routeId._id,
        startStopId: fromStopId,
        endStopId: toStopId,
        busId: bus._id,
        startTime: new Date(),
        status: 'onboard'
      };

      await user.save();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to(`bus_${bus.busId}`).emit('userBoarded', {
          userId: user.userId,
          username: user.username,
          fromStop: fromStop.name,
          toStop: toStop.name,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          tripId: user.currentTrip,
          bus: {
            busId: bus.busId,
            routeName: bus.routeId.routeName,
            location: bus.currentLocation
          },
          journey: {
            from: fromStop.name,
            to: toStop.name,
            estimatedTime: this.calculateJourneyTime(fromStop.location, toStop.location, bus.routeId.routeType)
          }
        },
        message: 'Trip started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting trip',
        error: error.message
      });
    }
  }

  // End trip (user gets off the bus)
  async endTrip(req, res) {
    try {
      const user = req.authenticatedUser;

      if (!user.currentTrip || user.currentTrip.status !== 'onboard') {
        return res.status(400).json({
          success: false,
          message: 'No active trip to end'
        });
      }

      // Update trip status
      user.currentTrip.status = 'completed';
      await user.save();

      res.json({
        success: true,
        message: 'Trip ended successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error ending trip',
        error: error.message
      });
    }
  }

  // Get user's travel history
  async getTravelHistory(req, res) {
    try {
      const user = req.authenticatedUser;
      const { limit = 20 } = req.query;

      // This would be implemented with a proper trip history collection
      // For now, return mock data
      const travelHistory = [
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          from: 'Main Street Station',
          to: 'Downtown Plaza',
          busId: 'BUS_001',
          duration: 25,
          distance: 8.5,
          fare: 15
        }
      ];

      res.json({
        success: true,
        data: {
          history: travelHistory.slice(0, parseInt(limit)),
          totalTrips: travelHistory.length,
          user: {
            username: user.username,
            totalTrips: user.currentTrip ? 1 : 0
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching travel history',
        error: error.message
      });
    }
  }

  // Helper method to calculate journey time
  calculateJourneyTime(fromLocation, toLocation, routeType = 'local') {
    const distance = this.calculateDistance(
      fromLocation.lat,
      fromLocation.lng,
      toLocation.lat,
      toLocation.lng
    );

    // Different speeds based on route type
    const speedMap = {
      'local': 25,      // 25 km/h average for local routes
      'express': 40,    // 40 km/h for express routes
      'intercity': 50,  // 50 km/h for intercity routes
      'deluxe': 45      // 45 km/h for deluxe routes
    };

    const averageSpeed = speedMap[routeType] || 25;
    const timeInHours = distance / averageSpeed;
    return Math.round(timeInHours * 60); // Return time in minutes
  }

  // Helper method to calculate distance
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

module.exports = new EnhancedUserController();
