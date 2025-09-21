const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const rateLimit = require('express-rate-limit');

// Rate limiting for external API calls
const locationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many location requests, please try again later'
});

// Apply rate limiting to all location routes
router.use(locationRateLimit);

// Search places with enhanced accuracy
router.get('/search', async (req, res) => {
    try {
        const { query, city, limit = 5 } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query must be at least 2 characters long'
            });
        }

        const result = await locationService.searchPlacesEnhanced(query, city, parseInt(limit));
        
        res.json({
            success: result.success,
            data: result.data || [],
            source: result.source,
            message: result.message
        });
    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({
            success: false,
            message: 'Location search failed'
        });
    }
});

// Geocode address to coordinates
router.post('/geocode', async (req, res) => {
    try {
        const { address, city, country = 'India' } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Address is required'
            });
        }

        const result = await locationService.geocodeAddress(address, city, country);
        res.json(result);
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            success: false,
            message: 'Geocoding failed'
        });
    }
});

// Reverse geocode coordinates to address
router.post('/reverse-geocode', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        if (!locationService.isValidCoordinates(latitude, longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }

        const result = await locationService.reverseGeocode(latitude, longitude);
        res.json(result);
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({
            success: false,
            message: 'Reverse geocoding failed'
        });
    }
});

// Get route between two points
router.post('/route', async (req, res) => {
    try {
        const { startLat, startLng, endLat, endLng, mode = 'driving' } = req.body;
        
        if (!startLat || !startLng || !endLat || !endLng) {
            return res.status(400).json({
                success: false,
                message: 'Start and end coordinates are required'
            });
        }

        if (!locationService.isValidCoordinates(startLat, startLng) || 
            !locationService.isValidCoordinates(endLat, endLng)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }

        // Try Google Directions first for better accuracy
        let result;
        try {
            result = await locationService.getRouteWithGoogleDirections(startLat, startLng, endLat, endLng, mode);
            if (result.success) {
                result.source = 'google_directions';
            }
        } catch (error) {
            console.log('Google Directions failed, falling back to other services');
            result = await locationService.getRoute(startLat, startLng, endLat, endLng, mode);
            result.source = result.success ? 'fallback' : 'error';
        }

        res.json(result);
    } catch (error) {
        console.error('Route calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Route calculation failed'
        });
    }
});

// Import bus stops from OpenStreetMap
router.post('/import-osm-stops', async (req, res) => {
    try {
        const { cityName, boundingBox } = req.body;
        
        if (!cityName || !boundingBox || boundingBox.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'City name and valid bounding box [south, west, north, east] are required'
            });
        }

        // Validate bounding box coordinates
        const [south, west, north, east] = boundingBox.map(Number);
        if (south >= north || west >= east) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bounding box coordinates'
            });
        }

        const result = await locationService.importBusStopsFromOSM(cityName, boundingBox);
        
        res.json({
            success: result.success,
            data: result.data || [],
            count: result.count || 0,
            source: result.source,
            message: result.message || `Imported ${result.count || 0} bus stops from OpenStreetMap`
        });
    } catch (error) {
        console.error('OSM import error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import bus stops from OpenStreetMap'
        });
    }
});

// Generate static map image
router.post('/static-map', async (req, res) => {
    try {
        const { waypoints, size = '600x400', maptype = 'roadmap' } = req.body;
        
        if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least 2 waypoints are required'
            });
        }

        // Validate waypoints
        for (const point of waypoints) {
            if (!point.lat || !point.lng || !locationService.isValidCoordinates(point.lat, point.lng)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid waypoint coordinates'
                });
            }
        }

        const result = await locationService.generateStaticMapImage(waypoints, size, maptype);
        res.json(result);
    } catch (error) {
        console.error('Static map generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate static map'
        });
    }
});

// Calculate distance between two points
router.post('/distance', (req, res) => {
    try {
        const { lat1, lng1, lat2, lng2 } = req.body;
        
        if (!lat1 || !lng1 || !lat2 || !lng2) {
            return res.status(400).json({
                success: false,
                message: 'All coordinates (lat1, lng1, lat2, lng2) are required'
            });
        }

        if (!locationService.isValidCoordinates(lat1, lng1) || 
            !locationService.isValidCoordinates(lat2, lng2)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }

        const distance = locationService.calculateDistance(lat1, lng1, lat2, lng2);
        
        res.json({
            success: true,
            data: {
                distance_meters: distance,
                distance_km: (distance / 1000).toFixed(2),
                distance_miles: (distance * 0.000621371).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Distance calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Distance calculation failed'
        });
    }
});

// Find nearby bus stops
router.get('/nearby-stops', (req, res) => {
    try {
        const { lat, lng, radius = 1000 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInMeters = parseInt(radius);

        if (!locationService.isValidCoordinates(latitude, longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }

        // This would typically fetch from your database
        // For demo purposes, returning mock data
        const mockBusStops = [
            {
                name: "Central Bus Station",
                location: { latitude: latitude + 0.001, longitude: longitude + 0.001 },
                description: "Main bus terminal"
            },
            {
                name: "City Mall Stop",
                location: { latitude: latitude - 0.002, longitude: longitude + 0.002 },
                description: "Shopping center bus stop"
            }
        ];

        const nearbyStops = locationService.findNearbyStops(
            latitude, 
            longitude, 
            mockBusStops, 
            radiusInMeters
        );

        res.json({
            success: true,
            data: nearbyStops,
            count: nearbyStops.length,
            radius: radiusInMeters
        });
    } catch (error) {
        console.error('Nearby stops error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find nearby stops'
        });
    }
});

// Clear location service cache
router.post('/clear-cache', (req, res) => {
    try {
        const result = locationService.clearCache();
        res.json(result);
    } catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cache'
        });
    }
});

// Get cache statistics
router.get('/cache-stats', (req, res) => {
    try {
        const stats = locationService.getCacheStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cache statistics'
        });
    }
});

module.exports = router;
