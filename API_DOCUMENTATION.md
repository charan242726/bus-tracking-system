# Enhanced Bus Tracking API Documentation

## Overview
This enhanced bus tracking system supports city-to-city bus search, real-time tracking of buses and drivers, route optimization, and map visualization.

## Base URL
```
http://localhost:3000/api
```

---

## City Management API

### Search Cities
Find cities by name for route planning.

```http
GET /api/cities/search?query={cityName}&limit=10
```

**Example:**
```bash
curl "http://localhost:3000/api/cities/search?query=mumbai&limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "city_id",
      "name": "Mumbai",
      "state": "Maharashtra",
      "centerLocation": {
        "lat": 19.0760,
        "lng": 72.8777
      }
    }
  ]
}
```

### Find Routes Between Cities
Search for available bus routes between two cities.

```http
GET /api/cities/routes?originCity={origin}&destinationCity={destination}
```

**Example:**
```bash
curl "http://localhost:3000/api/cities/routes?originCity=Mumbai&destinationCity=Pune"
```

---

## Bus Tracking API

### Find Available Buses Between Cities
Search for buses running between cities with real-time availability.

```http
GET /api/tracking/buses/search?originCity={origin}&destinationCity={destination}&routeType={type}
```

**Parameters:**
- `originCity` (required): Origin city name
- `destinationCity` (required): Destination city name  
- `routeType` (optional): `local`, `intercity`, `express`, `deluxe`
- `departureTime` (optional): Preferred departure time

**Example:**
```bash
curl "http://localhost:3000/api/tracking/buses/search?originCity=Mumbai&destinationCity=Pune&routeType=express"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "searchCriteria": {
      "origin": "Mumbai",
      "destination": "Pune",
      "routeType": "express"
    },
    "availableBuses": [
      {
        "busId": "BUS_001",
        "routeInfo": {
          "routeName": "Mumbai-Pune Express",
          "routeType": "express",
          "totalDistance": 148,
          "estimatedTravelTime": 180,
          "baseFare": 350
        },
        "currentLocation": {
          "lat": 19.0760,
          "lng": 72.8777
        },
        "occupancyPercentage": 65,
        "nextDeparture": {
          "time": "14:30",
          "busId": "bus_object_id"
        },
        "isAvailable": true,
        "driver": {
          "name": {
            "firstName": "Rajesh",
            "lastName": "Kumar"
          },
          "contactInfo": {
            "phone": "+91-9876543210"
          }
        }
      }
    ],
    "totalBuses": 5,
    "availableBuses": 3
  }
}
```

### Get Real-Time Bus Information
Get detailed real-time information about a specific bus.

```http
GET /api/tracking/buses/{busId}/realtime
```

**Example:**
```bash
curl "http://localhost:3000/api/tracking/buses/BUS_001/realtime"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bus": {
      "busId": "BUS_001",
      "currentLocation": {
        "lat": 19.0760,
        "lng": 72.8777,
        "timestamp": "2025-09-18T12:30:00Z",
        "speed": 45,
        "heading": 90
      },
      "currentStatus": {
        "status": "running",
        "currentPassengers": 32,
        "nextStopId": "stop_id",
        "estimatedArrival": "2025-09-18T12:45:00Z"
      },
      "occupancyPercentage": 64,
      "etaToNextStop": 15
    },
    "nearbyBusStops": [
      {
        "name": "Highway Plaza Stop",
        "location": {
          "lat": 19.0850,
          "lng": 72.8850
        },
        "distance": 1200
      }
    ]
  }
}
```

### Find Optimal Route for User
Get personalized route recommendations based on user location and preferences.

```http
POST /api/tracking/optimize-route
```

**Request Body:**
```json
{
  "userId": "USER_001",
  "destination": {
    "lat": 19.1136,
    "lng": 72.8697
  },
  "preferences": {
    "maxWalkingDistance": 1000,
    "preferAC": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "location": {
        "lat": 19.0760,
        "lng": 72.8777
      }
    },
    "destination": {
      "lat": 19.1136,
      "lng": 72.8697
    },
    "optimalRoutes": [
      {
        "bus": {
          "busId": "BUS_001",
          "occupancyPercentage": 45
        },
        "route": {
          "routeName": "Mumbai Local Route 1",
          "estimatedTravelTime": 45
        },
        "walkingInfo": {
          "toStop": {
            "name": "Nearest Bus Stop",
            "location": {
              "lat": 19.0780,
              "lng": 72.8790
            }
          },
          "distance": 300,
          "time": 4
        },
        "totalEstimatedTime": 49
      }
    ]
  }
}
```

---

## Real-Time Location Updates

### Update Bus Location (Driver App)
Drivers use this endpoint to update their bus location in real-time.

```http
POST /api/tracking/buses/location
```

**Request Body:**
```json
{
  "busId": "BUS_001",
  "lat": 19.0760,
  "lng": 72.8777,
  "speed": 45,
  "heading": 90,
  "accuracy": 5,
  "passengerCount": 28
}
```

---

## Socket.io Real-Time Events

### Client Events (Send to Server)

#### Join Bus Tracking
```javascript
socket.emit('joinBusTracking', 'BUS_001');
```

#### Driver Connection
```javascript
socket.emit('driverConnect', {
  driverId: 'DRIVER_001',
  busId: 'BUS_001'
});
```

#### User Location Update
```javascript
socket.emit('userLocationUpdate', {
  userId: 'USER_001',
  location: {
    lat: 19.0760,
    lng: 72.8777
  }
});
```

#### Real-time Bus Location Update
```javascript
socket.emit('busLocationUpdate', {
  busId: 'BUS_001',
  location: {
    lat: 19.0760,
    lng: 72.8777
  },
  speed: 45,
  heading: 90,
  passengerCount: 30,
  status: 'running'
});
```

#### Emergency Alert
```javascript
socket.emit('emergencyAlert', {
  driverId: 'DRIVER_001',
  busId: 'BUS_001',
  location: {
    lat: 19.0760,
    lng: 72.8777
  },
  alertType: 'breakdown',
  message: 'Bus engine failure'
});
```

### Server Events (Receive from Server)

#### Location Updates
```javascript
socket.on('locationUpdate', (data) => {
  console.log('Bus location update:', data);
  // {
  //   busId: 'BUS_001',
  //   location: { lat: 19.0760, lng: 72.8777 },
  //   status: 'running',
  //   occupancyPercentage: 65,
  //   timestamp: '2025-09-18T12:30:00Z'
  // }
});
```

#### Driver Status
```javascript
socket.on('driverOnline', (data) => {
  console.log('Driver came online:', data);
});

socket.on('driverOffline', (data) => {
  console.log('Driver went offline:', data);
});
```

#### Emergency Alerts
```javascript
socket.on('emergencyAlert', (data) => {
  console.log('Emergency alert:', data);
  // Handle emergency situation
});
```

#### Bus Arrival Estimates
```javascript
socket.on('busArrivalEstimate', (data) => {
  console.log('Bus arrival estimate:', data);
  // {
  //   busStopId: 'STOP_001',
  //   estimatedArrival: '2025-09-18T12:45:00Z',
  //   nearbyBuses: [...]
  // }
});
```

---

## Usage Examples

### 1. City-to-City Bus Search Flow

```bash
# Step 1: Search for cities
curl "http://localhost:3000/api/cities/search?query=Mumbai"
curl "http://localhost:3000/api/cities/search?query=Pune"

# Step 2: Find available buses
curl "http://localhost:3000/api/tracking/buses/search?originCity=Mumbai&destinationCity=Pune&routeType=express"

# Step 3: Get real-time info for selected bus
curl "http://localhost:3000/api/tracking/buses/BUS_001/realtime"
```

### 2. User Route Optimization Flow

```bash
# Step 1: Update user location
curl -X POST http://localhost:3000/api/users/USER_001/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 19.0760, "lng": 72.8777}'

# Step 2: Find optimal routes
curl -X POST http://localhost:3000/api/tracking/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_001",
    "destination": {"lat": 19.1136, "lng": 72.8697}
  }'
```

### 3. Driver Real-Time Updates

```bash
# Update bus location from driver app
curl -X POST http://localhost:3000/api/tracking/buses/location \
  -H "Content-Type: application/json" \
  -d '{
    "busId": "BUS_001",
    "lat": 19.0760,
    "lng": 72.8777,
    "speed": 45,
    "heading": 90,
    "passengerCount": 28
  }'
```

### 4. WebSocket Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Bus Tracking</title>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div id="busLocation"></div>
    
    <script>
        const socket = io();
        
        // Join bus tracking room
        socket.emit('joinBusTracking', 'BUS_001');
        
        // Listen for location updates
        socket.on('locationUpdate', (data) => {
            document.getElementById('busLocation').innerHTML = 
                `Bus ${data.busId} at ${data.location.lat}, ${data.location.lng}`;
        });
        
        // Handle emergency alerts
        socket.on('emergencyAlert', (data) => {
            alert(`Emergency: ${data.alertType} - ${data.message}`);
        });
    </script>
</body>
</html>
```

---

## External APIs Used

### Google Maps APIs
- **Places API**: Import bus stop data
- **Directions API**: Route optimization and directions  
- **Static Maps API**: Map visualization
- **Geocoding API**: Address to coordinates conversion

### OpenStreetMap
- **Overpass API**: Import bus stop data from OSM
- **Nominatim**: Geocoding and reverse geocoding

---

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bus-tracking
NODE_ENV=development

# External API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Resource not found  
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error
