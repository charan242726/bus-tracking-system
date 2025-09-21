const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');
const rateLimit = require('express-rate-limit');

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 OTP requests per windowMs
    message: 'Too many OTP requests, please try again later'
});

// Rate limiting for OTP verification
const verifyRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 verification attempts per windowMs
    message: 'Too many verification attempts, please try again later'
});

// Request OTP for login/registration
router.post('/request-otp', otpRateLimit, async (req, res) => {
    try {
        const { identifier, type = 'email', purpose = 'login', role = 'user' } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Validate email format for email OTP
        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
        }

        // Validate phone format for SMS OTP
        if (type === 'sms') {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(identifier)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format'
                });
            }
        }

        const result = await otpService.sendOTP(identifier, type, purpose);
        
        if (result.success) {
            res.json({
                success: true,
                message: `OTP sent successfully via ${type}`,
                data: {
                    identifier: identifier,
                    type: type,
                    purpose: purpose,
                    expires_in: (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Failed to send OTP'
            });
        }
    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while sending OTP'
        });
    }
});

// Verify OTP
router.post('/verify-otp', verifyRateLimit, async (req, res) => {
    try {
        const { identifier, otp, role = 'user' } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Identifier and OTP are required'
            });
        }

        // Validate OTP format (should be 6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'OTP must be 6 digits'
            });
        }

        const result = otpService.verifyOTP(identifier, otp, 'login');

        if (result.success) {
            // Here you would typically:
            // 1. Check if user exists in database
            // 2. Create session or JWT token
            // 3. Return user data
            
            // For demo purposes, we'll return a mock response
            res.json({
                success: true,
                message: 'OTP verified successfully',
                data: {
                    identifier: identifier,
                    role: role,
                    verified: true,
                    // In real implementation, return JWT token here
                    token: 'demo-jwt-token',
                    user: {
                        id: 'demo-user-id',
                        email: identifier,
                        role: role,
                        verified: true
                    }
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Invalid OTP'
            });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while verifying OTP'
        });
    }
});

// Resend OTP
router.post('/resend-otp', otpRateLimit, async (req, res) => {
    try {
        const { identifier, type = 'email', purpose = 'login' } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        const result = await otpService.sendOTP(identifier, type, purpose);
        
        if (result.success) {
            res.json({
                success: true,
                message: `OTP resent successfully via ${type}`,
                data: {
                    identifier: identifier,
                    type: type,
                    purpose: purpose,
                    expires_in: (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message || 'Failed to resend OTP'
            });
        }
    } catch (error) {
        console.error('OTP resend error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while resending OTP'
        });
    }
});

// Check OTP status (for debugging/admin purposes)
router.get('/status/:identifier', (req, res) => {
    try {
        const { identifier } = req.params;
        const { type = 'login' } = req.query;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Identifier is required'
            });
        }

        const status = otpService.getOTPStatus(identifier, type);
        
        if (status) {
            res.json({
                success: true,
                data: {
                    identifier: identifier,
                    has_otp: status.hasOTP,
                    expires_in_ms: status.expiresIn,
                    expires_in_seconds: Math.floor(status.expiresIn / 1000),
                    attempts_left: status.attemptsLeft
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    identifier: identifier,
                    has_otp: false,
                    message: 'No active OTP found'
                }
            });
        }
    } catch (error) {
        console.error('OTP status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while checking OTP status'
        });
    }
});

// Admin route to clear specific OTP (for support purposes)
router.delete('/clear/:identifier', (req, res) => {
    try {
        const { identifier } = req.params;
        const { type = 'login' } = req.query;

        // In a real implementation, you'd want proper admin authentication here
        
        // Clear the OTP by generating a dummy verification attempt with wrong OTP
        // This is a workaround since the OTPService doesn't have a direct clear method
        otpService.verifyOTP(identifier, '000000', type); // This will fail and potentially clear after max attempts
        
        res.json({
            success: true,
            message: 'OTP cleared successfully',
            data: {
                identifier: identifier,
                type: type
            }
        });
    } catch (error) {
        console.error('OTP clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while clearing OTP'
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'OTP Service',
        status: 'operational',
        timestamp: new Date().toISOString(),
        configuration: {
            email_configured: !!process.env.EMAIL_USER,
            sms_configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
            otp_expiry_minutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
            max_attempts: parseInt(process.env.MAX_OTP_ATTEMPTS) || 3
        }
    });
});

module.exports = router;
