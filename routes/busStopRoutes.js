const express = require('express');
const router = express.Router();
const busStopController = require('../controllers/busStopController');

// Create a new bus stop
router.post('/', busStopController.createBusStop);

// Get all bus stops with pagination
router.get('/', busStopController.getAllBusStops);

// Get nearby bus stops
router.get('/nearby', busStopController.getNearbyBusStops);

// Import bus stops from external API
router.post('/import', busStopController.importFromExternalAPI);

// Add bus stop to a route
router.post('/assign-route', busStopController.addStopToRoute);

// Get bus stop by ID
router.get('/:id', busStopController.getBusStopById);

// Update bus stop
router.put('/:id', busStopController.updateBusStop);

// Delete bus stop
router.delete('/:id', busStopController.deleteBusStop);

module.exports = router;
