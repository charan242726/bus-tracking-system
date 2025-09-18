const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/', userController.createUser);

// Get all users with pagination
router.get('/', userController.getAllUsers);

// Get nearby users
router.get('/nearby', userController.getNearbyUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user location
router.put('/:id/location', userController.updateUserLocation);

// Add favorite route
router.post('/:id/favorites/routes', userController.addFavoriteRoute);

// Add favorite bus stop
router.post('/:id/favorites/stops', userController.addFavoriteBusStop);

// Start a trip
router.post('/:id/trip/start', userController.startTrip);

// Update trip status
router.put('/:id/trip/status', userController.updateTripStatus);

// Get user's trip history
router.get('/:id/trip/history', userController.getUserTripHistory);

module.exports = router;
