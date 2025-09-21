const Bus = require('../models/Bus');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const User = require('../models/User');
const BusStop = require('../models/BusStop');
const City = require('../models/City');

class AdminController {
  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(req, res) {
    try {
      // Get basic counts
      const [
        totalBuses,
        totalDrivers,
        totalRoutes,
        totalUsers,
        totalBusStops,
        totalCities,
        onlineBuses,
        onlineDrivers,
        activeBuses
      ] = await Promise.all([
        Bus.countDocuments({ isActive: true }),
        Driver.countDocuments({ isActive: true }),
        Route.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: true }),
        BusStop.countDocuments({ isActive: true }),
        City.countDocuments({ isActive: true }),
        Bus.countDocuments({ isOnline: true, isActive: true }),
        Driver.countDocuments({ isOnline: true, isActive: true }),
        Bus.countDocuments({ 'currentStatus.status': 'running', isActive: true })
      ]);

      // Get recent activities
      const recentDriverActivities = await Driver.find({ isOnline: true })
        .populate('currentBus.busId', 'busId')
        .populate('currentBus.routeId', 'routeName')
        .sort({ updatedAt: -1 })
        .limit(10);

      // Get top performing routes by bus count
      const routeAnalytics = await Route.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'buses',
            localField: '_id',
            foreignField: 'routeId',
            as: 'buses'
          }
        },
        {
          $project: {
            routeName: 1,
            routeType: 1,
            activeBuses: { $size: '$buses' },
            'routeInfo.totalDistance': 1,
            'fare.baseFare': 1
          }
        },
        { $sort: { activeBuses: -1 } },
        { $limit: 5 }
      ]);

      // Get emergency alerts (last 24 hours)
      const emergencyAlerts = await Driver.find({
        'emergencyInfo.panicButtonPressed': true,
        'emergencyInfo.lastPanicTime': {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }).select('driverId name emergencyInfo.lastPanicTime emergencyInfo.panicButtonPressed');

      // Calculate occupancy statistics
      const busOccupancyStats = await Bus.aggregate([
        { $match: { isActive: true, isOnline: true } },
        {
          $group: {
            _id: null,
            averageOccupancy: {
              $avg: {
                $multiply: [
                  { $divide: ['$currentStatus.currentPassengers', { $ifNull: ['$busInfo.capacity.total', 50] }] },
                  100
                ]
              }
            },
            totalPassengers: { $sum: '$currentStatus.currentPassengers' },
            totalCapacity: { $sum: { $ifNull: ['$busInfo.capacity.total', 50] } }
          }
        }
      ]);

      const occupancyData = busOccupancyStats[0] || {
        averageOccupancy: 0,
        totalPassengers: 0,
        totalCapacity: 0
      };

      res.json({
        success: true,
        data: {
          overview: {
            totalBuses,
            totalDrivers,
            totalRoutes,
            totalUsers,
            totalBusStops,
            totalCities,
            onlineBuses,
            onlineDrivers,
            activeBuses
          },
          occupancyStats: {
            averageOccupancy: Math.round(occupancyData.averageOccupancy || 0),
            totalPassengers: occupancyData.totalPassengers,
            totalCapacity: occupancyData.totalCapacity,
            utilizationRate: occupancyData.totalCapacity > 0 ? 
              Math.round((occupancyData.totalPassengers / occupancyData.totalCapacity) * 100) : 0
          },
          recentActivities: recentDriverActivities.map(driver => ({
            driverId: driver.driverId,
            name: `${driver.name.firstName} ${driver.name.lastName}`,
            status: driver.currentBus?.status || 'off-duty',
            busId: driver.currentBus?.busId?.busId,
            routeName: driver.currentBus?.routeId?.routeName,
            lastUpdate: driver.updatedAt
          })),
          topRoutes: routeAnalytics,
          emergencyAlerts: emergencyAlerts.length,
          systemStatus: {
            operationalBuses: Math.round((onlineBuses / totalBuses) * 100),
            activeDrivers: Math.round((onlineDrivers / totalDrivers) * 100),
            systemHealth: onlineBuses > 0 && onlineDrivers > 0 ? 'good' : 'warning'
          }
        },
        message: 'Dashboard analytics retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard analytics',
        error: error.message
      });
    }
  }

  // Get all buses with detailed information
  async getAllBuses(req, res) {
    try {
      const { page = 1, limit = 20, status, routeId } = req.query;
      
      let query = { isActive: true };
      if (status) query['currentStatus.status'] = status;
      if (routeId) query.routeId = routeId;

      const buses = await Bus.find(query)
        .populate('routeId', 'routeName routeType')
        .populate('driverId', 'driverId name contactInfo')
        .sort({ updatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Bus.countDocuments(query);

      const busesWithInfo = buses.map(bus => ({
        ...bus.toObject(),
        occupancyPercentage: bus.getOccupancyPercentage(),
        lastUpdate: bus.currentLocation?.timestamp
      }));

      res.json({
        success: true,
        data: {
          buses: busesWithInfo,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching buses',
        error: error.message
      });
    }
  }

  // Get all drivers with detailed information
  async getAllDrivers(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      let query = { isActive: true };
      if (status) query['currentBus.status'] = status;

      const drivers = await Driver.find(query)
        .populate('currentBus.busId', 'busId busInfo')
        .populate('currentBus.routeId', 'routeName routeType')
        .sort({ updatedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Driver.countDocuments(query);

      res.json({
        success: true,
        data: {
          drivers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching drivers',
        error: error.message
      });
    }
  }

  // Create new bus
  async createBus(req, res) {
    try {
      const {
        busId,
        registrationNumber,
        model,
        manufacturer,
        capacity,
        amenities,
        routeId
      } = req.body;

      if (!busId || !registrationNumber || !routeId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID, registration number, and route ID are required'
        });
      }

      // Check if bus already exists
      const existingBus = await Bus.findOne({ busId });
      if (existingBus) {
        return res.status(409).json({
          success: false,
          message: 'Bus with this ID already exists'
        });
      }

      // Validate route exists
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      const bus = new Bus({
        busId,
        busInfo: {
          registrationNumber,
          model,
          manufacturer,
          capacity: capacity || { seated: 30, standing: 20, total: 50 },
          amenities: amenities || {}
        },
        routeId,
        currentLocation: { lat: 0, lng: 0, timestamp: new Date() }
      });

      await bus.save();

      res.status(201).json({
        success: true,
        data: bus,
        message: 'Bus created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating bus',
        error: error.message
      });
    }
  }

  // Update bus information
  async updateBus(req, res) {
    try {
      const { busId } = req.params;
      const updates = req.body;

      const bus = await Bus.findOneAndUpdate(
        { busId },
        updates,
        { new: true, runValidators: true }
      ).populate('routeId', 'routeName');

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found'
        });
      }

      res.json({
        success: true,
        data: bus,
        message: 'Bus updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating bus',
        error: error.message
      });
    }
  }

  // Assign driver to bus
  async assignDriverToBus(req, res) {
    try {
      const { busId, driverId } = req.body;

      if (!busId || !driverId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID and Driver ID are required'
        });
      }

      // Find bus and driver
      const [bus, driver] = await Promise.all([
        Bus.findOne({ busId }),
        Driver.findOne({ driverId })
      ]);

      if (!bus || !driver) {
        return res.status(404).json({
          success: false,
          message: 'Bus or driver not found'
        });
      }

      // Check if driver is already assigned
      if (driver.currentBus && driver.currentBus.status === 'on-duty') {
        return res.status(409).json({
          success: false,
          message: 'Driver is already assigned to another bus'
        });
      }

      // Assign driver to bus
      bus.driverId = driver._id;
      await bus.save();

      // Update driver assignment
      await driver.startShift(bus._id, bus.routeId);

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to('admin_room').emit('driverAssigned', {
          busId: bus.busId,
          driverId: driver.driverId,
          driverName: `${driver.name.firstName} ${driver.name.lastName}`,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          bus: { busId: bus.busId, routeId: bus.routeId },
          driver: { driverId: driver.driverId, name: driver.name }
        },
        message: 'Driver assigned to bus successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning driver to bus',
        error: error.message
      });
    }
  }

  // Get real-time system status
  async getSystemStatus(req, res) {
    try {
      // Get real-time counts
      const [onlineBuses, onlineDrivers, emergencyAlerts] = await Promise.all([
        Bus.find({
          isOnline: true,
          isActive: true,
          'currentLocation.timestamp': {
            $gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
          }
        }).populate('routeId', 'routeName')
          .populate('driverId', 'driverId name'),
        Driver.find({
          isOnline: true,
          isActive: true,
          'currentLocation.timestamp': {
            $gte: new Date(Date.now() - 10 * 60 * 1000)
          }
        }).populate('currentBus.busId', 'busId'),
        Driver.find({
          'emergencyInfo.panicButtonPressed': true,
          'emergencyInfo.lastPanicTime': {
            $gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        })
      ]);

      // Get route distribution
      const routeDistribution = await Bus.aggregate([
        { $match: { isOnline: true, isActive: true } },
        {
          $lookup: {
            from: 'routes',
            localField: 'routeId',
            foreignField: '_id',
            as: 'route'
          }
        },
        { $unwind: '$route' },
        {
          $group: {
            _id: '$route._id',
            routeName: { $first: '$route.routeName' },
            routeType: { $first: '$route.routeType' },
            busCount: { $sum: 1 },
            averageOccupancy: {
              $avg: {
                $multiply: [
                  { $divide: ['$currentStatus.currentPassengers', { $ifNull: ['$busInfo.capacity.total', 50] }] },
                  100
                ]
              }
            }
          }
        },
        { $sort: { busCount: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          liveStatus: {
            onlineBuses: onlineBuses.length,
            onlineDrivers: onlineDrivers.length,
            emergencyAlerts: emergencyAlerts.length,
            lastUpdated: new Date()
          },
          onlineBuses: onlineBuses.map(bus => ({
            busId: bus.busId,
            location: bus.currentLocation,
            routeName: bus.routeId?.routeName,
            driverName: bus.driverId ? `${bus.driverId.name.firstName} ${bus.driverId.name.lastName}` : null,
            occupancyPercentage: bus.getOccupancyPercentage(),
            status: bus.currentStatus.status
          })),
          onlineDrivers: onlineDrivers.map(driver => ({
            driverId: driver.driverId,
            name: `${driver.name.firstName} ${driver.name.lastName}`,
            location: driver.currentLocation,
            busId: driver.currentBus?.busId?.busId,
            shiftStatus: driver.currentBus?.status
          })),
          routeDistribution,
          alerts: emergencyAlerts.map(driver => ({
            driverId: driver.driverId,
            name: `${driver.name.firstName} ${driver.name.lastName}`,
            alertTime: driver.emergencyInfo.lastPanicTime,
            location: driver.currentLocation
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching system status',
        error: error.message
      });
    }
  }

  // Send announcement to all drivers
  async sendAnnouncement(req, res) {
    try {
      const { message, type = 'info', targetAudience = 'all' } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Announcement message is required'
        });
      }

      const announcement = {
        id: `announcement_${Date.now()}`,
        message,
        type, // info, warning, urgent
        timestamp: new Date(),
        from: 'Admin'
      };

      // Emit announcement via Socket.io
      const io = req.app.get('io');
      if (io) {
        if (targetAudience === 'drivers') {
          io.to('driver_room').emit('adminAnnouncement', announcement);
        } else if (targetAudience === 'users') {
          io.to('user_room').emit('adminAnnouncement', announcement);
        } else {
          io.emit('adminAnnouncement', announcement);
        }
      }

      res.json({
        success: true,
        data: announcement,
        message: `Announcement sent to ${targetAudience}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending announcement',
        error: error.message
      });
    }
  }

  // Get analytics data
  async getAnalytics(req, res) {
    try {
      const { period = '24h' } = req.query;
      
      let dateFilter;
      switch (period) {
        case '1h':
          dateFilter = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '24h':
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      // Bus utilization over time (mock data for now)
      const utilizationData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        activeBuses: Math.floor(Math.random() * 20) + 5,
        totalPassengers: Math.floor(Math.random() * 500) + 100,
        averageOccupancy: Math.floor(Math.random() * 40) + 40
      }));

      // Route performance
      const routePerformance = await Route.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'buses',
            localField: '_id',
            foreignField: 'routeId',
            as: 'buses'
          }
        },
        {
          $project: {
            routeName: 1,
            routeType: 1,
            totalBuses: { $size: '$buses' },
            activeBuses: {
              $size: {
                $filter: {
                  input: '$buses',
                  as: 'bus',
                  cond: { $eq: ['$$bus.isOnline', true] }
                }
              }
            },
            'routeInfo.totalDistance': 1,
            'fare.baseFare': 1
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          period,
          utilizationTrend: utilizationData,
          routePerformance,
          summary: {
            peakHour: utilizationData.reduce((max, curr) => 
              curr.activeBuses > max.activeBuses ? curr : max
            ).hour,
            averageOccupancy: Math.round(
              utilizationData.reduce((sum, curr) => sum + curr.averageOccupancy, 0) / utilizationData.length
            ),
            totalTrips: utilizationData.reduce((sum, curr) => sum + curr.totalPassengers, 0)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  }
}

module.exports = new AdminController();
