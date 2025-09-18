const express = require('express');
const router = express.Router();
const { updateBusLocation, getBusLocation } = require('../controllers/busController');

// POST /api/driver/location - Update bus location
router.post('/driver/location', updateBusLocation);

// GET /api/bus/:id/location - Get bus location
router.get('/bus/:id/location', getBusLocation);

module.exports = router;
