const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const Driver = require('../models/Driver');
const User = require('../models/User');

class AuthController {
  // Driver Registration
  async registerDriver(req, res) {
    try {
      const {
        driverId,
        employeeId,
        firstName,
        lastName,
        phone,
        email,
        licenseNumber,
        licenseClass,
        password
      } = req.body;

      // Validate required fields
      if (!driverId || !employeeId || !firstName || !lastName || !phone || !licenseNumber || !password) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: driverId, employeeId, firstName, lastName, phone, licenseNumber, password'
        });
      }

      // Check if driver already exists
      const existingDriver = await Driver.findOne({
        $or: [{ driverId }, { employeeId }, { 'contactInfo.phone': phone }]
      });

      if (existingDriver) {
        return res.status(409).json({
          success: false,
          message: 'Driver already exists with this ID, employee ID, or phone number'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new driver
      const driver = new Driver({
        driverId,
        employeeId,
        name: { firstName, lastName },
        contactInfo: { phone, email },
        credentials: { licenseNumber, licenseClass },
        password: hashedPassword
      });

      await driver.save();

      // Generate token
      const token = generateToken(driver._id, 'driver');

      res.status(201).json({
        success: true,
        data: {
          token,
          driver: {
            id: driver._id,
            driverId: driver.driverId,
            name: driver.name,
            contactInfo: driver.contactInfo
          }
        },
        message: 'Driver registered successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering driver',
        error: error.message
      });
    }
  }

  // Driver Login
  async loginDriver(req, res) {
    try {
      const { driverId, password } = req.body;

      if (!driverId || !password) {
        return res.status(400).json({
          success: false,
          message: 'Driver ID and password are required'
        });
      }

      // Find driver
      const driver = await Driver.findOne({ driverId, isActive: true }).select('+password');
      if (!driver) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or inactive account'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, driver.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(driver._id, 'driver');

      // Update driver status to online
      driver.isOnline = true;
      await driver.save();

      res.json({
        success: true,
        data: {
          token,
          driver: {
            id: driver._id,
            driverId: driver.driverId,
            name: driver.name,
            contactInfo: driver.contactInfo,
            currentBus: driver.currentBus
          }
        },
        message: 'Driver logged in successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during driver login',
        error: error.message
      });
    }
  }

  // User Registration
  async registerUser(req, res) {
    try {
      const {
        userId,
        username,
        email,
        phoneNumber,
        password
      } = req.body;

      // Validate required fields
      if (!userId || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: userId, username, email, password'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ userId }, { email }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this ID or email'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new User({
        userId,
        username,
        email,
        phoneNumber,
        password: hashedPassword
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id, 'user');

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            userId: user.userId,
            username: user.username,
            email: user.email
          }
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }

  // User Login
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or inactive account'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user._id, 'user');

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            userId: user.userId,
            username: user.username,
            email: user.email,
            currentLocation: user.currentLocation
          }
        },
        message: 'User logged in successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during user login',
        error: error.message
      });
    }
  }

  // Admin Login (simple implementation)
  async loginAdmin(req, res) {
    try {
      const { username, password } = req.body;

      // Simple admin credentials (in production, use proper database)
      const adminCredentials = {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      };

      if (username === adminCredentials.username && password === adminCredentials.password) {
        const token = generateToken('admin', 'admin');

        res.json({
          success: true,
          data: {
            token,
            admin: {
              username: 'admin',
              role: 'admin'
            }
          },
          message: 'Admin logged in successfully'
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during admin login',
        error: error.message
      });
    }
  }

  // Logout (for all roles)
  async logout(req, res) {
    try {
      const { role } = req.user;

      // Update online status for drivers
      if (role === 'driver') {
        const driver = await Driver.findById(req.user.userId);
        if (driver) {
          driver.isOnline = false;
          await driver.save();
        }
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const { userId, role } = req.user;

      let profile;
      if (role === 'driver') {
        profile = await Driver.findById(userId)
          .populate('currentBus.busId', 'busId busInfo')
          .populate('currentBus.routeId', 'routeName routeType');
      } else if (role === 'user') {
        profile = await User.findById(userId)
          .populate('currentTrip.routeId', 'routeName')
          .populate('currentTrip.busId', 'busId');
      } else {
        profile = { username: 'admin', role: 'admin' };
      }

      res.json({
        success: true,
        data: profile,
        role
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
