# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Transit Track - Full-Stack Bus Tracking System

A comprehensive real-time bus tracking application with both backend API and frontend interface. Supports city-to-city transportation, driver/user tracking, route optimization, live mapping, and public-facing web interface.

## Development Commands

### Backend Server
```bash
# Start development server with auto-reload (primary command)
npm run dev

# Production server
npm start

# Direct execution
node server.js
```

### Frontend Development
```bash
# Frontend files are static HTML/CSS/JS in /frontend/ directory
# Served automatically via Express static middleware at /public
# Access frontend at: http://localhost:3000/frontend/index.html

# Main pages:
# - index.html (homepage)
# - live tracking.html (real-time bus tracking with maps)
# - routes.html (route information and schedules)
# - services.html (service alerts and notifications)
# - contact page.html (contact and support)
```

### Setup & Prerequisites
```bash
# Install dependencies
npm install

# MongoDB must be running
# Default: mongodb://localhost:27017/bus-tracking
# Application will exit if MongoDB is not accessible
```

### Testing & Debugging
```bash
# Run specific test scripts
npm run test:city

# Test API endpoints
curl http://localhost:3000/
curl http://localhost:3000/api/bus/BUS_001/location
curl -X POST http://localhost:3000/api/driver/location -H "Content-Type: application/json" -d '{"busId": "BUS_001", "lat": 28.6139, "lng": 77.2090}'


## Architecture Overview

### Technology Stack
**Backend:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io WebSocket connections
- **Development**: Nodemon for auto-reload

**Frontend:**
- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js for interactive maps
- **Icons**: Font Awesome 6.0
- **Styling**: Custom CSS with CSS Grid/Flexbox
- **Mobile**: Responsive design with mobile-first approach

### Application Structure
This is a full-stack application with a Node.js/Express backend API and a responsive frontend interface:

#### Backend Components (MVC Architecture)
1. **Entry Point** (`server.js`): Express server with Socket.io integration
2. **Models** (`models/`): MongoDB schemas (Bus, Route, Driver, User, City, BusStop)
3. **Controllers** (`controllers/`): Business logic for API endpoints
4. **Routes** (`routes/`): RESTful API route definitions
5. **Services** (`services/`): External API integrations and utility functions
6. **Config** (`config/`): Database connection and environment configuration

#### Frontend Components
1. **Homepage** (`frontend/index.html`): Landing page with system overview
2. **Live Tracking** (`frontend/live tracking.html`): Real-time bus map with Leaflet.js
3. **Routes** (`frontend/routes.html`): Route schedules and information
4. **Services** (`frontend/services.html`): Service alerts and notifications
5. **Contact** (`frontend/contact page.html`): Support and contact forms

#### Data Models (MongoDB Collections)
- **Bus**: Real-time location, status, capacity, driver assignment, amenities
- **Route**: City-to-city connections, segments, schedules, fare structure
- **Driver**: Authentication, location tracking, performance metrics, emergency features
- **City**: Geospatial boundaries, major terminals, statistics
- **User**: Location tracking, trip history, preferences, authentication
- **BusStop**: Geospatial data, external API integration, route associations

#### Frontend Architecture
- **Responsive Design**: Mobile-first CSS with breakpoints at 768px and 480px
- **Real-time Updates**: JavaScript connects to Socket.io for live bus tracking
- **Interactive Maps**: Leaflet.js with OpenStreetMap tiles, custom bus markers
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Multi-language**: Language selector (placeholder functionality)

#### Real-time Architecture
The application implements a dual-layer real-time update system:
- **Room-based updates**: Clients join specific bus rooms (`bus_${busId}`) to receive targeted location updates
- **Global broadcasts**: All connected clients receive general bus location updates via `busLocationUpdate` event
- **Socket.io Integration**: The Express app shares the Socket.io instance via `app.set('io', io)`

#### Express Routing Architecture
- **Fast Routing**: Uses Express.js router system for efficient request handling
- **Modular Routes**: Separate route files (`busRoutes.js`, `routeRoutes.js`) mounted to `/api` prefix
- **Middleware Chain**: CORS, JSON parsing, and custom validation middleware
- **Route Organization**: RESTful route structure with clear endpoint separation

#### API Design Patterns
- RESTful endpoints with consistent response structure (`success`, `data`/`error`, `message`)
- Comprehensive input validation with detailed error responses
- Upsert operations for bus locations (create if not exists, update if exists)
- Population of related data (routes) in bus location responses

### Environment Configuration
```bash
# Required environment variables
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bus-tracking
NODE_ENV=development

# Optional external API keys (for production)
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Database Prerequisites
- MongoDB must be running locally or accessible via MONGODB_URI
- No seeding scripts exist; routes and buses are created via API calls
- Database name: `bus-tracking` (from default URI)

### Socket.io Events
- **Client → Server**: 
  - `joinBusTracking(busId)`, `leaveBusTracking(busId)`
  - `joinRouteTracking(routeId)`, `leaveRouteTracking(routeId)`
  - `driverConnect(driverData)`, `userLocationUpdate(userData)`
  - `busLocationUpdate(locationData)`, `emergencyAlert(alertData)`
  - `requestBusArrival(requestData)`
- **Server → Client**: 
  - `locationUpdate` (room-specific), `busLocationUpdate` (global)
  - `driverOnline/driverOffline`, `emergencyAlert`
  - `busArrivalEstimate`, `routeBusUpdate`

### Key Development Considerations

**Backend:**
- Controllers access Socket.io via `req.app.get('io')` for real-time updates
- Bus location updates trigger both database persistence and Socket.io broadcasts
- Geospatial indexing on location fields for efficient proximity queries
- Upsert operations handle new buses automatically
- CORS configured to allow all origins - restrict in production

**Frontend:**
- Static files served via Express middleware (app.use('frontend', express.static('frontend')))
- Live tracking page connects to Socket.io at runtime for bus updates
- All CSS is embedded in HTML files (no external stylesheets)
- Mock data used for demo purposes in live tracking interface
- Maps require internet connection for tile loading

### New API Endpoints
- **City Management**: `/api/cities/*` - City search, route discovery between cities
- **Enhanced Bus Tracking**: `/api/tracking/*` - Real-time tracking, route optimization, bus search
- **Driver Management**: Real-time location updates, emergency alerts, shift management
- **Route Optimization**: Intelligent route suggestions based on user location and preferences

### External APIs Integration
- **Google Maps APIs**: Places API (bus stops), Directions API (routing), Static Maps API (visualization)
- **OpenStreetMap**: Overpass API for importing bus stop data, Nominatim for geocoding
- **Real-time Features**: WebSocket-based tracking, emergency alerts, arrival predictions

### Enhanced Features
- **City-to-City Search**: Enter city names to find available buses and routes
- **Real-time Tracking**: Track both bus drivers and users with live location updates
- **Route Optimization**: Find most efficient routes based on traffic, occupancy, and user preferences
- **Map Visualization**: Generate static maps showing routes, bus locations, and nearby stops
- **Emergency System**: Driver panic button, real-time emergency alerts to admin dashboard

### Important Implementation Notes

**Project Structure:**
```
bus-tracking-backend/
├── frontend/                 # Static frontend files
│   ├── index.html           # Homepage
│   ├── live tracking.html   # Real-time tracking with maps
│   ├── routes.html          # Route information
│   ├── services.html        # Service alerts
│   └── contact page.html    # Contact/support
├── models/                  # MongoDB schemas
├── controllers/             # API logic
├── routes/                  # API endpoints
├── services/                # External integrations
├── config/                  # Configuration files
└── server.js               # Main application entry
```

**Current Limitations:**
- No authentication system (use mock data for development)
- No formal testing framework (Jest/Mocha recommended)
- Basic logging (console.log - consider Winston for production)
- Frontend uses mock data for demonstrations
- CORS allows all origins (secure for production)

**External Dependencies:**
- MongoDB must be running before starting server
- Internet connection required for map tiles (OpenStreetMap)
- Font Awesome CDN for icons
