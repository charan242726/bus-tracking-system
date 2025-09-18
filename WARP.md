# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Enhanced Bus Tracking System

This system now supports comprehensive city-to-city bus tracking, real-time driver and user tracking, route optimization, and map visualization capabilities.

## Development Commands

### Start/Run the Application
- **Development mode (with auto-reload)**: `npm run dev`
- **Production mode**: `npm start`
- **Direct execution**: `node server.js`

### Dependencies
- **Install all dependencies**: `npm install`
- **Install production dependencies only**: `npm install --production`

### Testing
- Currently no testing framework is configured (package.json shows placeholder test script)
- To add testing, consider installing Jest or Mocha and updating the test script

### API Testing
Test the API endpoints using curl:
```bash
# City-to-City Bus Search
curl "http://localhost:3000/api/cities/search?query=Mumbai"
curl "http://localhost:3000/api/tracking/buses/search?originCity=Mumbai&destinationCity=Pune&routeType=express"

# Real-time Bus Tracking
curl "http://localhost:3000/api/tracking/buses/BUS_001/realtime"
curl -X POST http://localhost:3000/api/tracking/buses/location -H "Content-Type: application/json" -d '{"busId": "BUS_001", "lat": 19.0760, "lng": 72.8777, "speed": 45}'

# Route Optimization
curl -X POST http://localhost:3000/api/tracking/optimize-route -H "Content-Type: application/json" -d '{"userId": "USER_001", "destination": {"lat": 19.1136, "lng": 72.8697}}'

# Legacy endpoints (still supported)
curl -X POST http://localhost:3000/api/driver/location -H "Content-Type: application/json" -d '{"busId": "BUS_001", "lat": 37.7749, "lng": -122.4194}'
curl http://localhost:3000/api/bus/BUS_001/location
curl http://localhost:3000/api/routes
```

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js (fast, unopinionated web framework for Node.js routing)
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io
- **Development**: Nodemon for auto-reloading

### Application Structure
This is a classic MVC (Model-View-Controller) Node.js application with the following key architectural patterns:

#### Core Components
1. **Entry Point** (`server.js`): Main application server that configures Express, Socket.io, and database connection
2. **Database Configuration** (`config/database.js`): MongoDB connection setup using Mongoose
3. **Models** (`models/`): Mongoose schemas for data persistence
4. **Controllers** (`controllers/`): Business logic and request handling
5. **Routes** (`routes/`): API endpoint definitions and route mappings

#### Data Models
- **Bus Model**: Enhanced with driver tracking, passenger count, real-time status, and detailed bus information (capacity, amenities)
- **Route Model**: Extended for city-to-city routes with segments, schedule information, fare structure, and route optimization
- **Driver Model**: New model for tracking bus drivers with location, performance metrics, emergency features
- **City Model**: New model for managing cities with geospatial boundaries and major terminals
- **User Model**: Enhanced with trip tracking and location-based services
- **BusStop Model**: Enhanced with external API integration and geospatial queries
- **Relationships**: Complex relationships between cities, routes, buses, drivers, and users with full population support

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
Required environment variables:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/bus-tracking)
- `NODE_ENV`: Environment mode (development/production)

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
- Controllers access Socket.io via `req.app.get('io')` for real-time updates
- Bus location updates trigger both database persistence and real-time broadcasts
- Coordinate validation ensures lat/lng are within valid ranges
- The application uses upsert pattern for bus location updates to handle new buses automatically
- CORS is configured to allow all origins (`origin: "*"`) - consider restricting in production

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

### Missing Components
- No authentication/authorization system implemented
- No testing framework configured (consider Jest/Mocha for comprehensive testing)
- No logging system beyond console.log statements (consider Winston or similar)
- Complete API documentation available in `API_DOCUMENTATION.md`
- No Docker configuration
- No environment file template (.env.example)
