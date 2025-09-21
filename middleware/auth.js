const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const User = require('../models/User');

// JWT secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authentication middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
  };
};

// Driver authentication middleware
const requireDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.userId);
    if (!driver || !driver.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Driver access required or account inactive.'
      });
    }
    req.driver = driver;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying driver.',
      error: error.message
    });
  }
};

// User authentication middleware
const requireUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User access required or account inactive.'
      });
    }
    req.authenticatedUser = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying user.',
      error: error.message
    });
  }
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
};

// Socket.io authentication middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  requireDriver,
  requireUser,
  requireAdmin,
  socketAuth,
  JWT_SECRET
};
