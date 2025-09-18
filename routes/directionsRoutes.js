const express = require('express');
const router = express.Router();
const directionsController = require('../controllers/directionsController');

// Get general directions between two points
router.post('/directions', directionsController.getDirections);

// Get directions to nearest bus stop
router.get('/nearest-stop', directionsController.getDirectionsToNearestBusStop);

// Get route planning between bus stops
router.post('/route-plan', directionsController.getRoutePlan);

// Get directions for a specific route
router.get('/route/:routeId', directionsController.getRouteDirections);

// Get smart journey recommendations
router.post('/recommendations', directionsController.getSmartJourneyRecommendations);

module.exports = router;
