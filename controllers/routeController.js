const Route = require('../models/Route');

// Get all routes (GET /routes)
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .select('routeId routeName startLocation endLocation stops isActive')
      .sort({ routeName: 1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });

  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get route by ID
const getRouteById = async (req, res) => {
  try {
    const routeId = req.params.id;

    if (!routeId) {
      return res.status(400).json({
        error: 'Route ID is required'
      });
    }

    const route = await Route.findOne({ routeId: routeId });

    if (!route) {
      return res.status(404).json({
        error: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Create a new route (for testing purposes)
const createRoute = async (req, res) => {
  try {
    const { routeId, routeName, startLocation, endLocation, stops } = req.body;

    // Basic validation
    if (!routeId || !routeName) {
      return res.status(400).json({
        error: 'Route ID and route name are required'
      });
    }

    // Check if route already exists
    const existingRoute = await Route.findOne({ routeId: routeId });
    if (existingRoute) {
      return res.status(400).json({
        error: 'Route with this ID already exists'
      });
    }

    const newRoute = new Route({
      routeId,
      routeName,
      startLocation,
      endLocation,
      stops: stops || []
    });

    const savedRoute = await newRoute.save();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: savedRoute
    });

  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute
};
