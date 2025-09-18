const Bus = require('../models/Bus');

// Update bus location (POST /driver/location)
const updateBusLocation = async (req, res) => {
  try {
    const { busId, lat, lng } = req.body;

    // Validation
    if (!busId || lat === undefined || lng === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: busId, lat, lng'
      });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        error: 'Latitude and longitude must be numbers'
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates: lat must be between -90 and 90, lng must be between -180 and 180'
      });
    }

    // Update or create bus location
    const updatedBus = await Bus.findOneAndUpdate(
      { busId: busId },
      {
        busId: busId,
        currentLocation: {
          lat: lat,
          lng: lng,
          timestamp: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    // Emit real-time location update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`bus_${busId}`).emit('locationUpdate', {
        busId: busId,
        location: {
          lat: lat,
          lng: lng,
          timestamp: updatedBus.currentLocation.timestamp
        }
      });

      // Also emit to general bus tracking room
      io.emit('busLocationUpdate', {
        busId: busId,
        location:{
          lat: lat,
          lng: lng,
          timestamp: updatedBus.currentLocation.timestamp
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus location updated successfully',
      data: {
        busId: updatedBus.busId,
        location: updatedBus.currentLocation
      }
    });

  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

// Get bus location (GET /bus/:id/location)
const getBusLocation = async (req, res) => {
  try {
    const busId = req.params.id;

    if (!busId) {
      return res.status(400).json({
        error: 'Bus ID is required'
      });
    }

    const bus = await Bus.findOne({ busId: busId }).populate('routeId');

    if (!bus) {
      return res.status(404).json({
        error: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        busId: bus.busId,
        location: bus.currentLocation,
        route: bus.routeId,
        isActive: bus.isActive
      }
    });

  } catch (error) {
    console.error('Error fetching bus location:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  updateBusLocation,
  getBusLocation
};
