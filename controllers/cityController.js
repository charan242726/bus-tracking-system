const City = require('../models/City');
const Route = require('../models/Route');
const BusStop = require('../models/BusStop');

class CityController {
  // Search cities by name
  async searchCities(req, res) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const cities = await City.findByName(query, parseInt(limit));

      res.json({
        success: true,
        data: cities,
        message: `Found ${cities.length} cities matching "${query}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching cities',
        error: error.message
      });
    }
  }

  // Get all cities
  async getAllCities(req, res) {
    try {
      const { page = 1, limit = 20, state } = req.query;
      const query = state ? { state, isActive: true } : { isActive: true };

      const cities = await City.find(query)
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await City.countDocuments(query);

      res.json({
        success: true,
        data: cities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching cities',
        error: error.message
      });
    }
  }

  // Get city details with available routes
  async getCityDetails(req, res) {
    try {
      const { cityId } = req.params;

      const city = await City.findById(cityId);
      if (!city) {
        return res.status(404).json({
          success: false,
          message: 'City not found'
        });
      }

      // Get routes originating from this city
      const outgoingRoutes = await Route.findFromCity(cityId);

      // Get routes ending in this city
      const incomingRoutes = await Route.find({
        'cities.destination.cityId': cityId,
        isActive: true
      }).populate('cities.origin.cityId cities.destination.cityId');

      // Get major bus stops in this city
      const busStops = await BusStop.find({
        'address.city': city.name,
        isActive: true
      }).limit(10);

      res.json({
        success: true,
        data: {
          city,
          routes: {
            outgoing: outgoingRoutes,
            incoming: incomingRoutes,
            totalRoutes: outgoingRoutes.length + incomingRoutes.length
          },
          majorBusStops: busStops,
          stats: {
            totalBusStops: busStops.length,
            totalRoutes: outgoingRoutes.length + incomingRoutes.length
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching city details',
        error: error.message
      });
    }
  }

  // Find routes between two cities
  async findRoutesBetweenCities(req, res) {
    try {
      const { originCity, destinationCity } = req.query;

      if (!originCity || !destinationCity) {
        return res.status(400).json({
          success: false,
          message: 'Both origin and destination city names are required'
        });
      }

      // Find cities by name
      const [originCities, destinationCities] = await Promise.all([
        City.findByName(originCity, 5),
        City.findByName(destinationCity, 5)
      ]);

      if (originCities.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Origin city "${originCity}" not found`
        });
      }

      if (destinationCities.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Destination city "${destinationCity}" not found`
        });
      }

      // Find direct routes between cities
      const directRoutes = [];
      for (const origin of originCities) {
        for (const destination of destinationCities) {
          const routes = await Route.findBetweenCities(origin._id, destination._id);
          directRoutes.push(...routes);
        }
      }

      // Calculate distances between city centers
      const routesWithDistance = directRoutes.map(route => {
        const originCity = originCities.find(c => 
          c._id.toString() === route.cities.origin.cityId.toString()
        );
        const destCity = destinationCities.find(c => 
          c._id.toString() === route.cities.destination.cityId.toString()
        );

        let distance = 0;
        if (originCity && destCity) {
          distance = originCity.distanceToCenter(
            destCity.centerLocation.lat, 
            destCity.centerLocation.lng
          );
        }

        return {
          ...route.toObject(),
          estimatedDistance: Math.round(distance),
          nextDeparture: route.getNextDeparture(),
          totalTime: route.calculateTotalTime()
        };
      });

      res.json({
        success: true,
        data: {
          searchCriteria: {
            origin: originCity,
            destination: destinationCity
          },
          possibleOrigins: originCities,
          possibleDestinations: destinationCities,
          directRoutes: routesWithDistance,
          routeCount: routesWithDistance.length
        },
        message: directRoutes.length > 0 ? 
          `Found ${directRoutes.length} direct routes` : 
          'No direct routes found between these cities'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding routes between cities',
        error: error.message
      });
    }
  }

  // Create a new city (admin function)
  async createCity(req, res) {
    try {
      const {
        cityId,
        name,
        state,
        country = 'India',
        centerLocation,
        majorTerminals
      } = req.body;

      if (!cityId || !name || !state || !centerLocation) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: cityId, name, state, centerLocation'
        });
      }

      const existingCity = await City.findOne({ cityId });
      if (existingCity) {
        return res.status(409).json({
          success: false,
          message: 'City with this ID already exists'
        });
      }

      const city = new City({
        cityId,
        name,
        state,
        country,
        centerLocation,
        majorTerminals: majorTerminals || []
      });

      await city.save();

      res.status(201).json({
        success: true,
        data: city,
        message: 'City created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating city',
        error: error.message
      });
    }
  }

  // Update city information
  async updateCity(req, res) {
    try {
      const { cityId } = req.params;
      const updates = req.body;

      const city = await City.findByIdAndUpdate(
        cityId,
        updates,
        { new: true, runValidators: true }
      );

      if (!city) {
        return res.status(404).json({
          success: false,
          message: 'City not found'
        });
      }

      res.json({
        success: true,
        data: city,
        message: 'City updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating city',
        error: error.message
      });
    }
  }

  // Get nearby cities
  async getNearbyCities(req, res) {
    try {
      const { lat, lng, radius = 100000 } = req.query; // 100km default

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistance = parseInt(radius);

      const nearbyCities = await City.find({
        centerLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        },
        isActive: true
      });

      // Calculate distances
      const citiesWithDistance = nearbyCities.map(city => {
        const distance = city.distanceToCenter(latitude, longitude);
        return {
          ...city.toObject(),
          distance: Math.round(distance * 1000) // meters
        };
      });

      res.json({
        success: true,
        data: citiesWithDistance,
        message: `Found ${citiesWithDistance.length} cities within ${maxDistance/1000}km`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error finding nearby cities',
        error: error.message
      });
    }
  }
}

module.exports = new CityController();
