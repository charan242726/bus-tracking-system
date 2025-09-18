const express = require('express');
const router = express.Router();
const { getAllRoutes, getRouteById, createRoute } = require('../controllers/routeController');

// GET /api/routes - Get all routes
router.get('/routes', getAllRoutes);

// GET /api/route/:id - Get route by ID
router.get('/route/:id', getRouteById);

// POST /api/routes - Create new route (for testing)
router.post('/routes', createRoute);

module.exports = router;
