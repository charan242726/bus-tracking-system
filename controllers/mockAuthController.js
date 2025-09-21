const { generateToken } = require('../middleware/auth');
const mockDB = require('../config/mockDatabase');

class MockAuthController {
  // Driver Login (mock version)
  async loginDriver(req, res) {
    try {
      const { driverId, password } = req.body;

      if (!driverId || !password) {
        return res.status(400).json({
          success: false,
          message: 'Driver ID and password are required'
        });
      }

      // Use mock database
      const driver = mockDB.findDriverByCredentials(driverId, password);
      
      if (!driver) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Use DRIVER_001 / password123 for demo'
        });
      }

      // Generate token
      const token = generateToken(driver._id, 'driver');

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

  // User Login (mock version)
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const user = mockDB.findUserByCredentials(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Use user@example.com / password123 for demo'
        });
      }

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

  // Admin Login (simple version)
  async loginAdmin(req, res) {
    try {
      const { username, password } = req.body;

      const adminCredentials = {
        username: 'admin',
        password: 'admin123'
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
          message: 'Invalid admin credentials. Use admin / admin123 for demo'
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

  // Logout
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Get Profile
  async getProfile(req, res) {
    try {
      const { userId, role } = req.user;
      
      let profile = { userId, role };
      if (role === 'admin') {
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

module.exports = new MockAuthController();
