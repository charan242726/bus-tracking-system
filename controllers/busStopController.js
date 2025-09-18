const BusStop = require('../models/BusStop');
const Route = require('../models/Route');
const externalApiService = require('../services/externalApiService');

class BusStopController {
  // Create a new bus stop
  async createBusStop(req, res) {
    try {
      const {
        stopId,
        name,
        description,
        location,
        address,
        amenities,
        externalData
      } = req.body;

      // Validate required fields
      if (!stopId || !name || !location || !location.lat || !location.lng) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: stopId, name, location.lat, location.lng'
        });
      }

      // Check if bus stop already exists
      const existingStop = await BusStop.findOne({ stopId });
      if (existingStop) {
        return res.status(409).json({
          success: false,
          message: 'Bus stop with this ID already exists'
        });
      }

      const busStop = new BusStop({
        stopId,
        name,
        description,
        location,
        address,
        amenities,
        externalData
      });

      await busStop.save();

      res.status(201).json({
        success: true,
        data: busStop,
        message: 'Bus stop created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating bus stop',
        error: error.message
      });
    }
  }

  // Get all bus stops
  async getAllBusStops(req, res) {
    try {
      const { page = 1, limit = 10, active, city } = req.query;
      // Build base query (filter by active if provided)
      const query = active !== undefined ? { isActive: active === 'true' } : {};

      // If a city query param is provided, filter by address.city (case-insensitive)
      if (city) {
        query['address.city'] = { $regex: `^${city}$`, $options: 'i' };
      }Since we don't have a .env file, let's first create one with a MongoDB connection string. I'll create a .env file with a default local MongoDB connection:

      const busStops = await BusStop.find(query)
        .populate('routes.routeId', 'routeName routeId')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ name: 1 });

      const total = await BusStop.countDocuments(query);

      res.json({
        success: true,
        data: busStops,
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
        message: 'Error fetching bus stops',
        error: error.message
      });
    }
  }

  // Get bus stop by ID
  async getBusStopById(req, res) {
    try {
      const { id } = req.params;
      const busStop = await BusStop.findOne({ 
        $or: [{ _id: id }, { stopId: id }] 
      }).populate('routes.routeId', 'routeName routeId startLocation endLocation');

      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
        });
      }

      res.json({
        success: true,
        data: busStop
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching bus stop',
        error: error.message
      });
    }
  }

  // Find nearby bus stops
  async getNearbyBusStops(req, res) {
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

      const nearbyStops = await BusStop.findNearby(latitude, longitude, maxDistance);

      // Calculate distances and add to response
      const stopsWithDistance = nearbyStops.map(stop => {
        const distance = stop.distanceTo(latitude, longitude);
        return {
          ...stop.toObject(),
          distance: Math.round(distance * 1000) // Convert to meters
        };
      });

      res.json({
        success: true,
        data: stopsWithDistance,
        message: `Found ${stopsWithDistance.length} bus stops within ${maxDistance}m`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding nearby bus stops',
        error: error.message
      });
    }
  }

  // Update bus stop
  async updateBusStop(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const busStop = await BusStop.findOneAndUpdate(
        { $or: [{ _id: id }, { stopId: id }] },
        updates,
        { new: true, runValidators: true }
      );

      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
        });
      }

      res.json({
        success: true,
        data: busStop,
        message: 'Bus stop updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating bus stop',
        error: error.message
      });
    }
  }

  // Delete bus stop
  async deleteBusStop(req, res) {
    try {
      const { id } = req.params;

      const busStop = await BusStop.findOneAndDelete({
        $or: [{ _id: id }, { stopId: id }]
      });

      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
        });
      }

      res.json({
        success: true,
        message: 'Bus stop deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting bus stop',
        error: error.message
      });
    }
  }

  // Add bus stop to a route
  async addStopToRoute(req, res) {
    try {
      const { stopId, routeId, sequence } = req.body;

      if (!stopId || !routeId || sequence === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: stopId, routeId, sequence'
        });
      }

      // Find the bus stop
      const busStop = await BusStop.findOne({ stopId });
      if (!busStop) {
        return res.status(404).json({
          success: false,
          message: 'Bus stop not found'
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

      // Check if stop is already in the route
      const existingRoute = busStop.routes.find(
        r => r.routeId.toString() === routeId
      );

      if (existingRoute) {
        return res.status(409).json({
          success: false,
          message: 'Bus stop is already assigned to this route'
        });
      }

      // Add route to bus stop
      busStop.routes.push({
        routeId,
        sequence
      });

      await busStop.save();

      res.json({
        success: true,
        data: busStop,
        message: 'Bus stop added to route successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding bus stop to route',
        error: error.message
      });
    }
  }

  // Import bus stops from external API
  async importFromExternalAPI(req, res) {
    try {
      const { sources = ['osm'], coordinates, radius = 5000 } = req.body;

      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: coordinates with lat and lng'
        });
      }

      // Validate coordinates
      if (!externalApiService.isValidCoordinates(coordinates.lat, coordinates.lng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }

      // Import bus stops from external APIs
      const importResult = await externalApiService.importBusStops(
        coordinates.lat,
        coordinates.lng,
        radius,
        sources
      );
      
      res.json({
        success: true,
        message: `Successfully imported ${importResult.totalImported} bus stops from ${sources.join(', ')}`,
        data: importResult
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error importing from external API',
        error: error.message
      });
    }
  }
}

module.exports = new BusStopController();
