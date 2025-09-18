# Bus Tracking Backend

A comprehensive real-time bus tracking system backend built with Node.js, Express, MongoDB, and Socket.io. Designed specifically for small cities with features for bus stops management, user tracking, and intelligent directions.

## Features

- **Real-time bus location tracking** with Socket.io
- **Comprehensive bus stop management** with geospatial queries
- **User tracking and journey management**
- **Intelligent directions and route planning**
- **External API integration** for importing bus stop data
- **RESTful API endpoints** with full CRUD operations
- **MongoDB data persistence** with geospatial indexing
- **Input validation and error handling**

## API Endpoints

### Bus Tracking

#### Update Bus Location
```
POST /api/driver/location
Content-Type: application/json

{
  "busId": "BUS_001",
  "lat": 37.7749,
  "lng": -122.4194
}
```

#### Get Bus Location
```
GET /api/bus/:id/location
```

#### Get All Routes
```
GET /api/routes
```

### Bus Stops Management

#### Create Bus Stop
```
POST /api/bus-stops
Content-Type: application/json

{
  "stopId": "STOP_001",
  "name": "Main Street Stop",
  "description": "Bus stop near downtown",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  }
}
```

#### Get All Bus Stops
```
GET /api/bus-stops?page=1&limit=10&active=true
```

#### Find Nearby Bus Stops
```
GET /api/bus-stops/nearby?lat=37.7749&lng=-122.4194&radius=1000
```

#### Import Bus Stops from External APIs
```
POST /api/bus-stops/import
Content-Type: application/json

{
  "coordinates": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "radius": 5000,
  "sources": ["osm", "google"]
}
```

### User Management

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "userId": "USER_001",
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

#### Update User Location
```
PUT /api/users/:id/location
Content-Type: application/json

{
  "lat": 37.7749,
  "lng": -122.4194
}
```

#### Start User Trip
```
POST /api/users/:id/trip/start
Content-Type: application/json

{
  "routeId": "route_object_id",
  "startStopId": "start_stop_object_id",
  "endStopId": "end_stop_object_id"
}
```

### Directions and Route Planning

#### Get Directions to Nearest Bus Stop
```
GET /api/directions/nearest-stop?lat=37.7749&lng=-122.4194&maxRadius=1000
```

#### Plan Route Between Bus Stops
```
POST /api/directions/route-plan
Content-Type: application/json

{
  "startStopId": "STOP_001",
  "endStopId": "STOP_002"
}
```

#### Get Smart Journey Recommendations
```
POST /api/directions/recommendations
Content-Type: application/json

{
  "userId": "USER_001",
  "destination": {
    "lat": 37.7849,
    "lng": -122.4094
  }
}
```

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bus-tracking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env` file and update MongoDB connection string if needed
   - Default MongoDB URI: `mongodb://localhost:27017/bus-tracking`

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Socket.io Events

### Client Events
- `joinBusTracking(busId)` - Join a specific bus tracking room
- `leaveBusTracking(busId)` - Leave a specific bus tracking room

### Server Events
- `locationUpdate` - Sent to specific bus room when location updates
- `busLocationUpdate` - Broadcast to all connected clients

## Project Structure

```
bus-tracking-backend/
├── config/
│   └── database.js              # MongoDB connection configuration
├── controllers/
│   ├── busController.js         # Bus-related business logic
│   ├── busStopController.js     # Bus stop management
│   ├── directionsController.js  # Directions and route planning
│   ├── routeController.js       # Route-related business logic
│   └── userController.js        # User tracking and management
├── models/
│   ├── Bus.js                   # Bus MongoDB schema
│   ├── BusStop.js              # Bus stop schema with geospatial support
│   ├── Route.js                # Route MongoDB schema
│   └── User.js                 # User schema with location tracking
├── routes/
│   ├── busRoutes.js            # Bus API routes
│   ├── busStopRoutes.js        # Bus stop API routes
│   ├── directionsRoutes.js     # Directions API routes
│   ├── routeRoutes.js          # Route API routes
│   └── userRoutes.js           # User API routes
├── services/
│   └── externalApiService.js   # External API integration (Google Maps, OSM)
├── .env                        # Environment variables
├── server.js                   # Main application entry point
└── package.json
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bus-tracking
NODE_ENV=development

# External API Keys (Optional - for importing bus stop data)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Update bus location
curl -X POST http://localhost:3000/api/driver/location \
  -H "Content-Type: application/json" \
  -d '{"busId": "BUS_001", "lat": 37.7749, "lng": -122.4194}'

# Get bus location
curl http://localhost:3000/api/bus/BUS_001/location

# Get all routes
curl http://localhost:3000/api/routes

# Create a bus stop
curl -X POST http://localhost:3000/api/bus-stops \
  -H "Content-Type: application/json" \
  -d '{"stopId": "STOP_001", "name": "Main Street Stop", "location": {"lat": 37.7749, "lng": -122.4194}}'

# Find nearby bus stops
curl "http://localhost:3000/api/bus-stops/nearby?lat=37.7749&lng=-122.4194&radius=1000"

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_001", "username": "john_doe", "email": "john@example.com"}'

# Update user location
curl -X PUT http://localhost:3000/api/users/USER_001/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 37.7749, "lng": -122.4194}'

# Get directions to nearest bus stop
curl "http://localhost:3000/api/directions/nearest-stop?lat=37.7749&lng=-122.4194"

# Import bus stops from OpenStreetMap
curl -X POST http://localhost:3000/api/bus-stops/import \
  -H "Content-Type: application/json" \
  -d '{"coordinates": {"lat": 37.7749, "lng": -122.4194}, "radius": 5000, "sources": ["osm"]}'
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
