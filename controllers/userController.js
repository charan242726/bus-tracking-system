const User = require('../models/User');
const BusStop = require('../models/BusStop');
const Route = require('../models/Route');

class UserController {
  // Create a new user
  async createUser(req, res) {
    try {
      const {
        userId,
        username,
        email,
        phoneNumber,
        currentLocation,
        preferences
      } = req.body;

      // Validate required fields
      if (!userId || !username || !email) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: userId, username, email'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ userId }, { email }] 
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this ID or email already exists'
        });
      }

      const user = new User({
        userId,
        username,
        email,
        phoneNumber,
        currentLocation,
        preferences
      });

      await user.save();

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, active } = req.query;
      const query = active !== undefined ? { isActive: active === 'true' } : {};

      const users = await User.find(query)
        .populate('preferences.favoriteRoutes.routeId', 'routeName routeId')
        .populate('preferences.favoriteBusStops.stopId', 'name stopId location')
        .populate('currentTrip.routeId', 'routeName')
        .populate('currentTrip.startStopId', 'name')
        .populate('currentTrip.endStopId', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ username: 1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      })
      .populate('preferences.favoriteRoutes.routeId', 'routeName routeId startLocation endLocation')
      .populate('preferences.favoriteBusStops.stopId', 'name stopId location address')
      .populate('currentTrip.routeId', 'routeName')
      .populate('currentTrip.startStopId', 'name location')
      .populate('currentTrip.endStopId', 'name location')
      .populate('currentTrip.busId', 'busId currentLocation');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  // Update user location
  async updateUserLocation(req, res) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.updateLocation(parseFloat(lat), parseFloat(lng));

      res.json({
        success: true,
        data: {
          userId: user.userId,
          location: user.currentLocation
        },
        message: 'User location updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user location',
        error: error.message
      });
    }
  }

  // Find nearby users
  async getNearbyUsers(req, res) {
    try {
      const { lat, lng, radius = 1000 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistance = parseInt(radius);

      const nearbyUsers = await User.findNearby(latitude, longitude, maxDistance);

      // Calculate distances and add to response
      const usersWithDistance = nearbyUsers.map(user => {
        const distance = user.distanceTo(latitude, longitude);
        return {
          userId: user.userId,
          username: user.username,
          currentLocation: user.currentLocation,
          distance: distance ? Math.round(distance * 1000) : null // Convert to meters
        };
      });

      res.json({
        success: true,
        data: usersWithDistance,
        message: `Found ${usersWithDistance.length} users within ${maxDistance}m`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding nearby users',
        error: error.message
      });
    }
  }

  // Add favorite route
  async addFavoriteRoute(req, res) {
    try {
      const { id } = req.params;
      const { routeId, alias } = req.body;

      if (!routeId) {
        return res.status(400).json({
          success: false,
          message: 'routeId is required'
        });
      }

      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if route exists
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      // Check if already favorite
      const existingFavorite = user.preferences.favoriteRoutes.find(
        fav => fav.routeId.toString() === routeId
      );

      if (existingFavorite) {
        return res.status(409).json({
          success: false,
          message: 'Route is already in favorites'
        });
      }

      user.preferences.favoriteRoutes.push({
        routeId,
        alias: alias || route.routeName
      });

      await user.save();

      res.json({
        success: true,
        data: user.preferences.favoriteRoutes,
        message: 'Route added to favorites successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding favorite route',
        error: error.message
      });
    }
  }

  // Add favorite bus stop
  async addFavoriteBusStop(req, res) {
    try {
      const { id } = req.params;
      const { stopId, alias } = req.body;

      if (!stopId) {
        return res.status(400).json({
          success: false,
          message: 'stopId is required'
        });
      }

      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if bus stop exists
      const busStop = await BusStop.findById(stopId);
      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
        });
      }

      // Check if already favorite
      const existingFavorite = user.preferences.favoriteBusStops.find(
        fav => fav.stopId.toString() === stopId
      );

      if (existingFavorite) {
        return res.status(409).json({
          success: false,
          message: 'Bus stop is already in favorites'
        });
      }

      user.preferences.favoriteBusStops.push({
        stopId,
        alias: alias || busStop.name
      });

      await user.save();

      res.json({
        success: true,
        data: user.preferences.favoriteBusStops,
        message: 'Bus stop added to favorites successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding favorite bus stop',
        error: error.message
      });
    }
  }

  // Start a trip
  async startTrip(req, res) {
    try {
      const { id } = req.params;
      const { routeId, startStopId, endStopId } = req.body;

      if (!routeId || !startStopId || !endStopId) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: routeId, startStopId, endStopId'
        });
      }

      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update current trip
      user.currentTrip = {
        routeId,
        startStopId,
        endStopId,
        startTime: new Date(),
        status: 'waiting'
      };

      await user.save();

      res.json({
        success: true,
        data: user.currentTrip,
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

  // Update trip status
  async updateTripStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, busId } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.currentTrip || !user.currentTrip.routeId) {
        return res.status(400).json({
          success: false,
          message: 'No active trip found'
        });
      }

      user.currentTrip.status = status;
      if (busId) {
        user.currentTrip.busId = busId;
      }

      await user.save();

      res.json({
        success: true,
        data: user.currentTrip,
        message: 'Trip status updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating trip status',
        error: error.message
      });
    }
  }

  // Get user's trip history
  async getUserTripHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // This would require a separate TripHistory model for full implementation
      // For now, return the current trip information
      const user = await User.findOne({ 
        $or: [{ _id: id }, { userId: id }] 
      })
      .populate('currentTrip.routeId', 'routeName')
      .populate('currentTrip.startStopId', 'name location')
      .populate('currentTrip.endStopId', 'name location')
      .populate('currentTrip.busId', 'busId');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          currentTrip: user.currentTrip,
          tripHistory: [] // Placeholder for trip history
        },
        message: 'Trip history retrieved (current trip only - full history requires TripHistory model)'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trip history',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
