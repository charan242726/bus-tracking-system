require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const busStopRoutes = require('./routes/busStopRoutes');
const userRoutes = require('./routes/userRoutes');
const directionsRoutes = require('./routes/directionsRoutes');
const cityRoutes = require('./routes/cityRoutes');
const busTrackingRoutes = require('./routes/busTrackingRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', busRoutes);
app.use('/api', routeRoutes);
app.use('/api/bus-stops', busStopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/directions', directionsRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/tracking', busTrackingRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room for bus tracking
  socket.on('joinBusTracking', (busId) => {
    socket.join(`bus_${busId}`);
    console.log(`Socket ${socket.id} joined bus_${busId} room`);
  });

  // Leave a room
  socket.on('leaveBusTracking', (busId) => {
    socket.leave(`bus_${busId}`);
    console.log(`Socket ${socket.id} left bus_${busId} room`);
  });

  // Join route tracking room
  socket.on('joinRouteTracking', (routeId) => {
    socket.join(`route_${routeId}`);
    console.log(`Socket ${socket.id} joined route_${routeId} room`);
  });

  // Leave route tracking room
  socket.on('leaveRouteTracking', (routeId) => {
    socket.leave(`route_${routeId}`);
    console.log(`Socket ${socket.id} left route_${routeId} room`);
  });

  // Driver authentication and tracking
  socket.on('driverConnect', (driverData) => {
    const { driverId, busId } = driverData;
    socket.join(`driver_${driverId}`);
    socket.join(`bus_driver_${busId}`);
    socket.driverId = driverId;
    socket.busId = busId;
    console.log(`Driver ${driverId} connected for bus ${busId}`);
    
    // Notify admin dashboard
    socket.broadcast.emit('driverOnline', {
      driverId,
      busId,
      timestamp: new Date()
    });
  });

  // User location tracking
  socket.on('userLocationUpdate', (userData) => {
    const { userId, location } = userData;
    socket.userId = userId;
    socket.join(`user_${userId}`);
    
    // Broadcast user location to relevant services
    socket.broadcast.emit('userLocationUpdate', {
      userId,
      location,
      timestamp: new Date()
    });
  });

  // Real-time bus location updates from driver
  socket.on('busLocationUpdate', (locationData) => {
    const { busId, location, speed, heading, passengerCount, status } = locationData;
    
    // Broadcast to all users tracking this bus
    socket.to(`bus_${busId}`).emit('busLocationUpdate', {
      busId,
      location,
      speed,
      heading,
      passengerCount,
      status,
      timestamp: new Date()
    });

    // Broadcast to route tracking rooms
    if (socket.routeId) {
      socket.to(`route_${socket.routeId}`).emit('routeBusUpdate', {
        busId,
        location,
        status,
        timestamp: new Date()
      });
    }
  });

  // Emergency alerts from drivers
  socket.on('emergencyAlert', (alertData) => {
    const { driverId, busId, location, alertType, message } = alertData;
    
    console.log(`Emergency alert from driver ${driverId}: ${alertType}`);
    
    // Broadcast emergency to admin and relevant authorities
    io.emit('emergencyAlert', {
      driverId,
      busId,
      location,
      alertType,
      message,
      timestamp: new Date(),
      socketId: socket.id
    });
  });

  // Request bus arrival time
  socket.on('requestBusArrival', (requestData) => {
    const { busStopId, userId } = requestData;
    
    // This would typically trigger a calculation and response
    // For now, we'll emit a placeholder response
    socket.emit('busArrivalEstimate', {
      busStopId,
      estimatedArrival: new Date(Date.now() + 10 * 60000), // 10 minutes from now
      nearbyBuses: [], // Would be populated with actual nearby bus data
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // If it was a driver, notify others
    if (socket.driverId && socket.busId) {
      socket.broadcast.emit('driverOffline', {
        driverId: socket.driverId,
        busId: socket.busId,
        timestamp: new Date()
      });
    }
  });
});

// Make io available to our routes
app.set('io', io);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bus Tracking API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/driver/location - Update bus location',
      'GET /api/bus/:id/location - Get bus location',
      'GET /api/routes - Get all routes',
      'GET /api/bus-stops - Get all bus stops',
      'GET /api/bus-stops/nearby - Find nearby bus stops',
      'POST /api/users - Create user',
      'PUT /api/users/:id/location - Update user location',
      'GET /api/directions/nearest-stop - Get directions to nearest bus stop',
      'POST /api/directions/route-plan - Plan route between stops',
      'POST /api/directions/recommendations - Get smart journey recommendations'
    ]
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for real-time communication`);
});
