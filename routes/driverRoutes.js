const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, requireDriver } = require('../middleware/auth');

// All driver routes require authentication
router.use(verifyToken);
router.use(requireDriver);

// Shift management
router.post('/shift/start', driverController.startShift);
router.post('/shift/end', driverController.endShift);

// Location and status updates
router.post('/location/update', driverController.updateBusLocation);
router.post('/passengers/update', driverController.updatePassengerCount);

// Dashboard and information
router.get('/dashboard', driverController.getDashboard);

// Emergency features
router.post('/emergency', driverController.emergencyAlert);

module.exports = router;
