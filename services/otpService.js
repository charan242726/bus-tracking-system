const nodemailer = require('nodemailer');
const twilio = require('twilio');
const crypto = require('crypto');

class OTPService {
    constructor() {
        // Email transporter
        this.emailTransporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Twilio client (optional)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }

        // In-memory OTP storage (use Redis in production)
        this.otpStorage = new Map();
        
        // Clean expired OTPs every minute
        setInterval(() => {
            this.cleanExpiredOTPs();
        }, 60000);
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateOTPKey(identifier, type = 'login') {
        return `${type}:${identifier}`;
    }

    storeOTP(identifier, otp, type = 'login') {
        const key = this.generateOTPKey(identifier, type);
        const expiryTime = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;
        
        this.otpStorage.set(key, {
            otp,
            expiryTime,
            attempts: 0,
            maxAttempts: parseInt(process.env.MAX_OTP_ATTEMPTS) || 3
        });
    }

    verifyOTP(identifier, providedOTP, type = 'login') {
        const key = this.generateOTPKey(identifier, type);
        const stored = this.otpStorage.get(key);

        if (!stored) {
            return { success: false, message: 'OTP not found or expired' };
        }

        if (Date.now() > stored.expiryTime) {
            this.otpStorage.delete(key);
            return { success: false, message: 'OTP has expired' };
        }

        stored.attempts++;

        if (stored.attempts > stored.maxAttempts) {
            this.otpStorage.delete(key);
            return { success: false, message: 'Too many invalid attempts' };
        }

        if (stored.otp !== providedOTP) {
            this.otpStorage.set(key, stored);
            return { 
                success: false, 
                message: `Invalid OTP. ${stored.maxAttempts - stored.attempts} attempts remaining` 
            };
        }

        this.otpStorage.delete(key);
        return { success: true, message: 'OTP verified successfully' };
    }

    async sendEmailOTP(email, otp, purpose = 'login') {
        try {
            const subject = purpose === 'registration' ? 
                'Welcome to Bus Tracking - Verify Your Email' : 
                'Bus Tracking System - Login Verification';

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 15px 0; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚌 Bus Tracking System</h1>
                            <p>Secure ${purpose === 'registration' ? 'Registration' : 'Login'} Verification</p>
                        </div>
                        <div class="content">
                            <h2>Your Verification Code</h2>
                            <p>Hello! You've requested ${purpose === 'registration' ? 'to register for' : 'to log into'} the Bus Tracking System.</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; font-size: 18px;">Your verification code is:</p>
                                <div class="otp-code">${otp}</div>
                                <p style="margin: 0; color: #666;">Enter this code to continue</p>
                            </div>

                            <div class="warning">
                                <strong>Security Notice:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes</li>
                                    <li>Never share this code with anyone</li>
                                    <li>Our team will never ask for your verification code</li>
                                </ul>
                            </div>

                            <p>If you didn't request this verification, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 Bus Tracking System - Secure & Reliable Public Transport</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await this.emailTransporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: email,
                subject: subject,
                html: htmlContent
            });

            return { success: true, message: 'OTP sent to email successfully' };
        } catch (error) {
            console.error('Email OTP Error:', error);
            return { success: false, message: 'Failed to send email OTP' };
        }
    }

    async sendSMSOTP(phoneNumber, otp, purpose = 'login') {
        if (!this.twilioClient) {
            return { success: false, message: 'SMS service not configured' };
        }

        try {
            await this.twilioClient.messages.create({
                body: `Your Bus Tracking System ${purpose} verification code is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Never share this code.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });

            return { success: true, message: 'OTP sent to phone successfully' };
        } catch (error) {
            console.error('SMS OTP Error:', error);
            return { success: false, message: 'Failed to send SMS OTP' };
        }
    }

    async sendOTP(identifier, type = 'email', purpose = 'login') {
        const otp = this.generateOTP();
        this.storeOTP(identifier, otp, purpose);

        if (type === 'email') {
            return await this.sendEmailOTP(identifier, otp, purpose);
        } else if (type === 'sms') {
            return await this.sendSMSOTP(identifier, otp, purpose);
        } else {
            return { success: false, message: 'Invalid OTP type' };
        }
    }

    cleanExpiredOTPs() {
        const now = Date.now();
        for (const [key, data] of this.otpStorage.entries()) {
            if (now > data.expiryTime) {
                this.otpStorage.delete(key);
            }
        }
    }

    // Get OTP status (for testing/debugging)
    getOTPStatus(identifier, type = 'login') {
        const key = this.generateOTPKey(identifier, type);
        const stored = this.otpStorage.get(key);
        
        if (!stored) return null;
        
        return {
            hasOTP: true,
            expiresIn: Math.max(0, stored.expiryTime - Date.now()),
            attemptsLeft: stored.maxAttempts - stored.attempts
        };
    }
}

module.exports = new OTPService();
