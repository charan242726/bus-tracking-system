const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard and analytics
router.get('/dashboard', adminController.getDashboardAnalytics);
router.get('/system/status', adminController.getSystemStatus);
router.get('/analytics', adminController.getAnalytics);

// Bus management
router.get('/buses', adminController.getAllBuses);
router.post('/buses', adminController.createBus);
router.put('/buses/:busId', adminController.updateBus);

// Driver management
router.get('/drivers', adminController.getAllDrivers);
router.post('/drivers/assign', adminController.assignDriverToBus);

// Communication
router.post('/announcements', adminController.sendAnnouncement);

module.exports = router;
