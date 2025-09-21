const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Driver authentication
router.post('/driver/register', authController.registerDriver);
router.post('/driver/login', authController.loginDriver);

// User authentication
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);

// Admin authentication
router.post('/admin/login', authController.loginAdmin);

// Common routes (requires authentication)
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
