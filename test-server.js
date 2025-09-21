require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Mock controllers for testing
const mockAuthController = require('./controllers/mockAuthController');
const mockDB = require('./config/mockDatabase');
const { verifyToken, socketAuth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock auth routes
app.post('/api/auth/driver/login', mockAuthController.loginDriver);
app.post('/api/auth/user/login', mockAuthController.loginUser);
app.post('/api/auth/admin/login', mockAuthController.loginAdmin);
app.post('/api/auth/logout', verifyToken, mockAuthController.logout);
app.get('/api/auth/profile', verifyToken, mockAuthController.getProfile);

// Mock driver routes
app.post('/api/driver/shift/start', verifyToken, (req, res) => {
  const { busId, routeId } = req.body;
  
  if (!busId || !routeId) {
    return res.status(400).json({
      success: false,
      message: 'Bus ID and Route ID are required'
    });
  }

  // Update mock driver
  const driver = mockDB.updateDriverShift(req.user.userId, 'on-duty', busId);
  
  if (driver) {
    // Update mock bus
    mockDB.updateBusLocation(busId, { lat: 19.0760, lng: 72.8777 });
    
    res.json({
      success: true,
      data: { driver, busId, routeId },
      message: 'Shift started successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Driver not found'
    });
  }
});

app.post('/api/driver/shift/end', verifyToken, (req, res) => {
  const driver = mockDB.updateDriverShift(req.user.userId, 'off-duty');
  
  if (driver) {
    res.json({
      success: true,
      message: 'Shift ended successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Driver not found'
    });
  }
});

app.post('/api/driver/location/update', verifyToken, (req, res) => {
  const { lat, lng, speed, passengerCount } = req.body;
  
  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  // Update bus location in mock DB
  const bus = mockDB.updateBusLocation('BUS_001', { lat, lng, speed });
  
  if (bus) {
    // Update passenger count
    if (passengerCount !== undefined) {
      bus.currentStatus.currentPassengers = Math.min(passengerCount, 50);
    }

    // Emit real-time update
    io.to('bus_BUS_001').emit('locationUpdate', {
      busId: 'BUS_001',
      location: { lat, lng },
      status: 'running',
      occupancyPercentage: bus.getOccupancyPercentage(),
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        busId: 'BUS_001',
        location: { lat, lng },
        occupancyPercentage: bus.getOccupancyPercentage()
      },
      message: 'Location updated successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }
});

app.post('/api/driver/emergency', verifyToken, (req, res) => {
  const { alertType, message } = req.body;
  
  if (!alertType) {
    return res.status(400).json({
      success: false,
      message: 'Alert type is required'
    });
  }

  // Emit emergency alert
  io.emit('emergencyAlert', {
    driverId: 'DRIVER_001',
    alertType,
    message: message || `Emergency alert from driver`,
    timestamp: new Date(),
    severity: 'high'
  });

  res.json({
    success: true,
    data: {
      alertId: `alert_${Date.now()}`,
      alertType,
      status: 'sent'
    },
    message: 'Emergency alert sent successfully'
  });
});

// Mock city search routes  
app.get('/api/cities/search', (req, res) => {
  const { query, limit = 10 } = req.query;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const cities = mockDB.findCitiesByName(query, parseInt(limit));
  
  res.json({
    success: true,
    data: cities,
    message: `Found ${cities.length} cities matching "${query}"`
  });
});

// Mock passenger routes
app.get('/api/passenger/bus-stands/search', (req, res) => {
  const { cityName, radius = 10000 } = req.query;
  
  if (!cityName) {
    return res.status(400).json({
      success: false,
      message: 'City name is required'
    });
  }

  const busStops = mockDB.findBusStopsByCity(cityName);
  
  res.json({
    success: true,
    data: {
      city: { name: cityName },
      busStands: busStops.map(stop => ({
        id: stop._id,
        name: stop.name,
        location: stop.location,
        address: stop.address,
        amenities: stop.amenities
      })),
      totalFound: busStops.length
    },
    message: `Found ${busStops.length} bus stands in ${cityName}`
  });
});

// Mock admin routes
app.get('/api/admin/dashboard', verifyToken, (req, res) => {
  const analytics = mockDB.getBusAnalytics();
  
  res.json({
    success: true,
    data: {
      overview: analytics,
      occupancyStats: {
        averageOccupancy: 65,
        totalPassengers: 125,
        totalCapacity: 200
      },
      systemStatus: {
        operationalBuses: 85,
        activeDrivers: 92,
        systemHealth: 'good'
      }
    },
    message: 'Dashboard analytics retrieved successfully'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Enhanced Bus Tracking API Server (Test Mode)',
    version: '1.0.0',
    testMode: true,
    endpoints: [
      'POST /api/auth/driver/login - Driver login (DRIVER_001 / password123)',
      'POST /api/auth/user/login - User login (user@example.com / password123)', 
      'POST /api/auth/admin/login - Admin login (admin / admin123)',
      'GET /api/cities/search - Search cities',
      'GET /api/passenger/bus-stands/search - Search bus stands',
      'POST /api/driver/location/update - Update bus location (driver only)',
      'GET /api/admin/dashboard - Admin dashboard (admin only)'
    ]
  });
});

// Enhanced Socket.io with auth
io.use((socket, next) => {
  // Allow connections without auth for testing
  socket.user = { userId: 'test_user', role: 'user' };
  next();
});

io.on('connection', (socket) => {
  const { userId, role } = socket.user;
  console.log(`${role} connected:`, socket.id);

  socket.join(`${role}_room`);
  
  socket.on('joinBusTracking', (busId) => {
    socket.join(`bus_${busId}`);
    console.log(`Socket ${socket.id} joined bus_${busId} room`);
  });

  socket.on('leaveBusTracking', (busId) => {
    socket.leave(`bus_${busId}`);
    console.log(`Socket ${socket.id} left bus_${busId} room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚌 Enhanced Bus Tracking Server running on port ${PORT}`);
  console.log(`📱 Driver App: http://localhost:${PORT}/driver.html`);
  console.log(`🌐 Main Page: http://localhost:${PORT}/`);
  console.log('🔧 Test Mode: No MongoDB required!');
  console.log('\n🔐 Demo Credentials:');
  console.log('   Driver: DRIVER_001 / password123');
  console.log('   User: user@example.com / password123');
  console.log('   Admin: admin / admin123');
});

module.exports = { app, server, io };
