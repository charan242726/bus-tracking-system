const express = require('express');
const router = express.Router();
const busTrackingController = require('../controllers/busTrackingController');

// Find available buses between cities
router.get('/buses/search', busTrackingController.findAvailableBuses);

// Get real-time bus information
router.get('/buses/:busId/realtime', busTrackingController.getBusRealTimeInfo);

// Get all buses on a specific route
router.get('/routes/:routeId/buses', busTrackingController.getBusesOnRoute);

// Find optimal route for user
router.post('/optimize-route', busTrackingController.findOptimalRoute);

// Update bus location (from driver app)
router.post('/buses/location', busTrackingController.updateBusLocation);

module.exports = router;
