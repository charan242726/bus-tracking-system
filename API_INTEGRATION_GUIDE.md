# Bus Tracking System - Free External APIs Integration Guide

## 🚀 Overview

This guide provides information about the free external APIs integrated into your bus tracking system for enhanced accuracy and functionality.

## 📍 Location & Mapping APIs

### 1. **OpenStreetMap (OSM) - Completely Free**

#### Nominatim API (Geocoding)
- **URL**: `https://nominatim.openstreetmap.org`
- **Purpose**: Address geocoding and reverse geocoding
- **Rate Limit**: 1 request per second
- **No API Key Required**

#### Overpass API (Bus Stop Data)
- **URL**: `https://overpass-api.de/api/interpreter`
- **Purpose**: Import real bus stop data from OSM
- **Rate Limit**: Reasonable use (25 second timeout per query)
- **No API Key Required**

#### OSRM (Routing)
- **URL**: `http://router.project-osrm.org`
- **Purpose**: Route calculation between points
- **Rate Limit**: Reasonable use
- **No API Key Required**

### 2. **LocationIQ - Free Tier**
- **Website**: https://locationiq.com/
- **Free Quota**: 5,000 requests/day
- **Features**: Geocoding, reverse geocoding, search
- **API Key**: Required (free)
- **Pricing**: $0 for up to 5,000 requests/day

### 3. **MapBox - Free Tier**
- **Website**: https://www.mapbox.com/
- **Free Quota**: 50,000 requests/month
- **Features**: Maps, geocoding, directions
- **API Key**: Required (free)
- **Pricing**: $0.50-$1.00 per 1,000 requests after free tier

### 4. **Google Maps - Free Credits**
- **Website**: https://cloud.google.com/maps-platform/
- **Free Quota**: $200 credit/month (≈ 28,000 requests)
- **Features**: Places API, Directions API, Static Maps API
- **API Key**: Required (credit card needed)
- **Pricing**: $0.005-0.020 per request after credits

## 📱 Communication APIs

### 1. **Email (Nodemailer with Gmail)**
- **Cost**: Free with Gmail account
- **Purpose**: Send OTP via email
- **Setup**: Use App Passwords for Gmail
- **Rate Limit**: 2,000 emails/day (Gmail)

### 2. **Twilio - Free Trial**
- **Website**: https://www.twilio.com/
- **Free Credits**: $15.50 trial credit
- **Purpose**: SMS OTP verification
- **Pricing**: $0.0075 per SMS after trial
- **Alternative**: Use email OTP instead

## 🔧 Environment Setup

Create a `.env` file with the following configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bus-tracking
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000

# Email Configuration (Free with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com

# SMS Configuration (Optional - Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# LocationIQ (5k requests/day free)
LOCATIONIQ_ACCESS_TOKEN=your-locationiq-token

# MapBox (50k requests/month free)
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Google Maps (Most accurate - $200 credit/month)
GOOGLE_MAPS_API_KEY=AIza-your-google-maps-key

# OpenStreetMap (Completely free - no keys needed)
NOMINATIM_URL=https://nominatim.openstreetmap.org

# OTP Configuration
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=3
```

## 📋 API Endpoints Created

### Location Services (`/api/location/`)

1. **Search Places** - `GET /api/location/search`
   - Enhanced place search with multiple API fallbacks
   - Query params: `query`, `city`, `limit`

2. **Geocoding** - `POST /api/location/geocode`
   - Convert addresses to coordinates
   - Body: `{ address, city, country }`

3. **Reverse Geocoding** - `POST /api/location/reverse-geocode`
   - Convert coordinates to addresses
   - Body: `{ latitude, longitude }`

4. **Route Calculation** - `POST /api/location/route`
   - Get routes between points with Google Directions fallback
   - Body: `{ startLat, startLng, endLat, endLng, mode }`

5. **Import OSM Bus Stops** - `POST /api/location/import-osm-stops`
   - Import real bus stop data from OpenStreetMap
   - Body: `{ cityName, boundingBox: [south, west, north, east] }`

6. **Static Maps** - `POST /api/location/static-map`
   - Generate static map images
   - Body: `{ waypoints: [{ lat, lng }], size, maptype }`

### OTP Services (`/api/auth/`)

1. **Request OTP** - `POST /api/auth/request-otp`
   - Send OTP via email or SMS
   - Body: `{ identifier, type, purpose, role }`

2. **Verify OTP** - `POST /api/auth/verify-otp`
   - Verify OTP code
   - Body: `{ identifier, otp, role }`

3. **Resend OTP** - `POST /api/auth/resend-otp`
   - Resend OTP code
   - Body: `{ identifier, type, purpose }`

## 🚦 Rate Limiting Implementation

- **OTP Requests**: 5 per 15 minutes per IP
- **OTP Verification**: 10 per 15 minutes per IP
- **Location Requests**: 100 per 15 minutes per IP

## 📊 Cost-Effective Usage Strategy

### Recommended Tier Progression:

1. **Development/Testing**:
   - Use OpenStreetMap APIs (completely free)
   - Use Gmail for email OTP
   - No API keys required

2. **Small Scale Production**:
   - Add LocationIQ (5k requests/day free)
   - Continue with OpenStreetMap as fallback
   - Total cost: $0

3. **Medium Scale Production**:
   - Add MapBox (50k requests/month free)
   - Use LocationIQ + OSM as fallbacks
   - Total cost: $0 initially

4. **Large Scale Production**:
   - Add Google Maps API ($200 credit/month)
   - Use all APIs with intelligent fallbacks
   - Total cost: ~$0-50/month depending on usage

## 🛠 How to Get API Keys

### 1. LocationIQ (Free)
1. Visit https://locationiq.com/
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env` file

### 2. MapBox (Free)
1. Visit https://www.mapbox.com/
2. Create free account
3. Get access token from dashboard
4. Add to `.env` file

### 3. Google Maps (Free Credits)
1. Visit https://cloud.google.com/maps-platform/
2. Create Google Cloud account (credit card required)
3. Enable Maps JavaScript API, Places API, Directions API
4. Create API key with restrictions
5. Add to `.env` file

### 4. Gmail App Password (Free)
1. Enable 2-factor authentication on Gmail
2. Go to Google Account settings
3. Generate app password for "Mail"
4. Use this password in `.env` file

## 🔒 Security Best Practices

1. **Restrict API Keys**:
   - Google Maps: Restrict by HTTP referrers and IPs
   - LocationIQ: Use API key restrictions
   - MapBox: Set allowed URLs

2. **Environment Variables**:
   - Never commit API keys to version control
   - Use different keys for development/production

3. **Rate Limiting**:
   - Implement proper rate limiting
   - Cache responses where possible

## 📈 Monitoring & Analytics

The admin dashboard includes:
- API usage statistics
- Cache hit rates
- Error monitoring
- Performance metrics

## 🚌 Bus Stop Data Sources

Your system can import real bus stop data from:

1. **OpenStreetMap**: Free, community-maintained
2. **Google Places**: Most accurate, paid after credits
3. **Government Open Data**: Free, varies by city
4. **Manual Entry**: Through admin dashboard

## 🔄 API Fallback Chain

The system uses intelligent fallbacks:

1. **Primary**: Google APIs (if configured)
2. **Secondary**: LocationIQ (if configured)
3. **Fallback**: OpenStreetMap (always available)

This ensures your system always works, even if one service is down.

## 📞 Support

For issues with external APIs:
- OpenStreetMap: https://help.openstreetmap.org/
- LocationIQ: https://locationiq.com/support
- MapBox: https://docs.mapbox.com/help/
- Google Maps: https://developers.google.com/maps/support/

## 🎯 Next Steps

1. Set up your `.env` file with the API keys you want to use
2. Test the system with free APIs first
3. Gradually add paid APIs as your user base grows
4. Monitor usage through the admin dashboard
5. Scale API usage based on your needs

Your bus tracking system is now equipped with enterprise-grade location services while keeping costs minimal! 🚀
