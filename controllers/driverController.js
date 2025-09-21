const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const BusStop = require('../models/BusStop');

class DriverController {
  // Start driver shift and assign bus
  async startShift(req, res) {
    try {
      const { busId, routeId } = req.body;
      const driver = req.driver;

      if (!busId || !routeId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID and Route ID are required'
        });
      }

      // Check if bus exists and is available
      const bus = await Bus.findOne({ busId, isActive: true });
      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Bus not found or inactive'
        });
      }

      // Check if bus is already assigned to another driver
      if (bus.driverId && bus.driverId.toString() !== driver._id.toString()) {
        return res.status(409).json({
          success: false,
          message: 'Bus is already assigned to another driver'
        });
      }

      // Check if route exists
      const route = await Route.findById(routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      // Start shift
      await driver.startShift(bus._id, routeId);

      // Assign driver to bus
      bus.driverId = driver._id;
      bus.routeId = routeId;
      bus.isOnline = true;
      await bus.save();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('driverShiftStart', {
          driverId: driver.driverId,
          busId: bus.busId,
          routeName: route.routeName,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          driver: {
            id: driver._id,
            name: driver.name,
            currentBus: driver.currentBus
          },
          bus: {
            busId: bus.busId,
            routeName: route.routeName
          }
        },
        message: 'Shift started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting shift',
        error: error.message
      });
    }
  }

  // End driver shift
  async endShift(req, res) {
    try {
      const driver = req.driver;

      if (!driver.currentBus || driver.currentBus.status === 'off-duty') {
        return res.status(400).json({
          success: false,
          message: 'No active shift to end'
        });
      }

      // Find and update bus
      const bus = await Bus.findById(driver.currentBus.busId);
      if (bus) {
        bus.isOnline = false;
        bus.currentStatus.status = 'out-of-service';
        await bus.save();
        await bus.endTrip();
      }

      // End driver shift
      await driver.endShift();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('driverShiftEnd', {
          driverId: driver.driverId,
          busId: bus?.busId,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Shift ended successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error ending shift',
        error: error.message
      });
    }
  }

  // Update bus location (driver only)
  async updateBusLocation(req, res) {
    try {
      const { lat, lng, speed, heading, accuracy, passengerCount, nextStopId, status } = req.body;
      const driver = req.driver;

      if (lat == null || lng == null) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Check if driver is on duty
      if (!driver.currentBus || driver.currentBus.status !== 'on-duty') {
        return res.status(403).json({
          success: false,
          message: 'Driver must be on duty to update location'
        });
      }

      // Find bus
      const bus = await Bus.findById(driver.currentBus.busId)
        .populate('routeId', 'routeName stops');

      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Assigned bus not found'
        });
      }

      // Update driver location
      await driver.updateLocation(lat, lng, { speed, heading, accuracy });

      // Update bus location
      await bus.updateLocation(lat, lng, { speed, heading, accuracy });

      // Update passenger count if provided
      if (passengerCount !== undefined) {
        await bus.updatePassengerCount(passengerCount);
      }

      // Update bus status if provided
      if (status) {
        bus.currentStatus.status = status;
      }

      // Update next stop if provided
      if (nextStopId) {
        bus.currentStatus.nextStopId = nextStopId;
        bus.currentStatus.estimatedArrival = new Date(Date.now() + 10 * 60000); // 10 min estimate
      }

      await bus.save();

      // Emit real-time updates via Socket.io
      const io = req.app.get('io');
      if (io) {
        // Emit to specific bus tracking room
        io.to(`bus_${bus.busId}`).emit('locationUpdate', {
          busId: bus.busId,
          location: bus.currentLocation,
          status: bus.currentStatus.status,
          occupancyPercentage: bus.getOccupancyPercentage(),
          driver: {
            name: driver.name,
            phone: driver.contactInfo.phone
          },
          timestamp: new Date()
        });

        // Emit general bus location update
        io.emit('busLocationUpdate', {
          busId: bus.busId,
          location: bus.currentLocation,
          routeId: bus.routeId._id,
          routeName: bus.routeId.routeName,
          status: bus.currentStatus.status
        });

        // Emit to route tracking room
        io.to(`route_${bus.routeId._id}`).emit('routeBusUpdate', {
          busId: bus.busId,
          location: bus.currentLocation,
          status: bus.currentStatus.status,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          busId: bus.busId,
          location: bus.currentLocation,
          status: bus.currentStatus.status,
          occupancyPercentage: bus.getOccupancyPercentage(),
          lastUpdated: bus.currentLocation.timestamp
        },
        message: 'Location updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating bus location',
        error: error.message
      });
    }
  }

  // Get driver dashboard data
  async getDashboard(req, res) {
    try {
      const driver = req.driver;

      // Get current bus and route info
      let currentBus = null;
      let currentRoute = null;
      if (driver.currentBus && driver.currentBus.busId) {
        currentBus = await Bus.findById(driver.currentBus.busId)
          .populate('routeId', 'routeName routeType schedule');
        currentRoute = currentBus?.routeId;
      }

      // Get recent performance metrics
      const performanceData = {
        totalTrips: driver.performance.totalTrips,
        averageRating: driver.performance.averageRating,
        onTimePercentage: driver.performance.onTimePercentage
      };

      // Get next stops if on route
      let upcomingStops = [];
      if (currentRoute) {
        upcomingStops = await BusStop.find({
          'routes.routeId': currentRoute._id,
          isActive: true
        }).sort({ 'routes.sequence': 1 }).limit(5);
      }

      res.json({
        success: true,
        data: {
          driver: {
            id: driver._id,
            name: driver.name,
            driverId: driver.driverId,
            currentLocation: driver.currentLocation,
            isOnline: driver.isOnline,
            shiftStatus: driver.currentBus?.status || 'off-duty'
          },
          currentBus: currentBus ? {
            busId: currentBus.busId,
            location: currentBus.currentLocation,
            status: currentBus.currentStatus.status,
            occupancyPercentage: currentBus.getOccupancyPercentage(),
            passengerCount: currentBus.currentStatus.currentPassengers
          } : null,
          currentRoute: currentRoute ? {
            id: currentRoute._id,
            routeName: currentRoute.routeName,
            routeType: currentRoute.routeType
          } : null,
          performance: performanceData,
          upcomingStops: upcomingStops.slice(0, 3),
          shiftInfo: {
            shiftStart: driver.currentBus?.shiftStart,
            status: driver.currentBus?.status
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      });
    }
  }

  // Emergency alert
  async emergencyAlert(req, res) {
    try {
      const { alertType, message, location } = req.body;
      const driver = req.driver;

      if (!alertType) {
        return res.status(400).json({
          success: false,
          message: 'Alert type is required'
        });
      }

      // Trigger panic button
      await driver.triggerPanic();

      const alertLocation = location || driver.currentLocation;

      // Get current bus info
      const bus = driver.currentBus?.busId ? 
        await Bus.findById(driver.currentBus.busId) : null;

      // Emit emergency alert via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('emergencyAlert', {
          driverId: driver.driverId,
          driverName: `${driver.name.firstName} ${driver.name.lastName}`,
          busId: bus?.busId,
          location: alertLocation,
          alertType,
          message: message || `Emergency alert from driver ${driver.driverId}`,
          timestamp: new Date(),
          severity: 'high'
        });

        // Also emit to admin room
        io.to('admin_room').emit('driverEmergency', {
          driver: driver.driverId,
          location: alertLocation,
          alertType,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          alertId: `alert_${Date.now()}`,
          alertType,
          timestamp: new Date(),
          status: 'sent'
        },
        message: 'Emergency alert sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending emergency alert',
        error: error.message
      });
    }
  }

  // Update passenger count
  async updatePassengerCount(req, res) {
    try {
      const { passengerCount } = req.body;
      const driver = req.driver;

      if (passengerCount == null || passengerCount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid passenger count is required'
        });
      }

      // Check if driver is on duty
      if (!driver.currentBus || driver.currentBus.status !== 'on-duty') {
        return res.status(403).json({
          success: false,
          message: 'Driver must be on duty to update passenger count'
        });
      }

      // Find and update bus
      const bus = await Bus.findById(driver.currentBus.busId);
      if (!bus) {
        return res.status(404).json({
          success: false,
          message: 'Assigned bus not found'
        });
      }

      await bus.updatePassengerCount(passengerCount);

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to(`bus_${bus.busId}`).emit('passengerCountUpdate', {
          busId: bus.busId,
          passengerCount: bus.currentStatus.currentPassengers,
          occupancyPercentage: bus.getOccupancyPercentage(),
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          busId: bus.busId,
          passengerCount: bus.currentStatus.currentPassengers,
          occupancyPercentage: bus.getOccupancyPercentage(),
          capacity: bus.busInfo?.capacity?.total || 50
        },
        message: 'Passenger count updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating passenger count',
        error: error.message
      });
    }
  }
}

module.exports = new DriverController();
