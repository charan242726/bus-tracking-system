const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Search cities by name
router.get('/search', cityController.searchCities);

// Get all cities with pagination
router.get('/', cityController.getAllCities);

// Get nearby cities
router.get('/nearby', cityController.getNearbyCities);

// Find routes between cities
router.get('/routes', cityController.findRoutesBetweenCities);

// Get city details with routes and bus stops
router.get('/:cityId', cityController.getCityDetails);

// Create a new city (admin)
router.post('/', cityController.createCity);

// Update city information
router.put('/:cityId', cityController.updateCity);

module.exports = router;
