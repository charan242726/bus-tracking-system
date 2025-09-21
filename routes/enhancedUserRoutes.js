const express = require('express');
const router = express.Router();
const enhancedUserController = require('../controllers/enhancedUserController');
const { verifyToken, requireUser } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/bus-stands/search', enhancedUserController.searchBusStandsInCity);
router.get('/buses/destination', enhancedUserController.findBusesToDestination);
router.get('/bus-stops/:stopId/arrivals', enhancedUserController.getBusArrivals);

// Protected routes (require user authentication)
router.use(verifyToken);
router.use(requireUser);

// Trip management
router.post('/trip/start', enhancedUserController.startTrip);
router.post('/trip/end', enhancedUserController.endTrip);
router.get('/trip/history', enhancedUserController.getTravelHistory);

module.exports = router;
