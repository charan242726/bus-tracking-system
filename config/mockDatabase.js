// Mock database for testing without MongoDB
class MockDatabase {
  constructor() {
    this.drivers = new Map();
    this.users = new Map();
    this.buses = new Map();
    this.routes = new Map();
    this.cities = new Map();
    this.busStops = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample cities
    this.cities.set('city_mumbai', {
      _id: 'city_mumbai',
      cityId: 'city_mumbai',
      name: 'Mumbai',
      state: 'Maharashtra',
      centerLocation: { lat: 19.0760, lng: 72.8777 },
      isActive: true
    });

    this.cities.set('city_pune', {
      _id: 'city_pune', 
      cityId: 'city_pune',
      name: 'Pune',
      state: 'Maharashtra',
      centerLocation: { lat: 18.5204, lng: 73.8567 },
      isActive: true
    });

    // Sample routes
    this.routes.set('route_001', {
      _id: 'route_001',
      routeId: 'route_001',
      routeName: 'Mumbai Local Route 1',
      routeType: 'local',
      cities: {
        origin: { cityId: 'city_mumbai', name: 'Mumbai' },
        destination: { cityId: 'city_pune', name: 'Pune' }
      },
      startLocation: { name: 'Mumbai Central', lat: 19.0760, lng: 72.8777 },
      endLocation: { name: 'Pune Station', lat: 18.5204, lng: 73.8567 },
      fare: { baseFare: 150 },
      routeInfo: { totalDistance: 150, estimatedTravelTime: 180 },
      isActive: true
    });

    // Sample bus stops
    this.busStops.set('stop_001', {
      _id: 'stop_001',
      stopId: 'stop_001',
      name: 'Mumbai Central Bus Stand',
      location: { lat: 19.0760, lng: 72.8777 },
      address: { city: 'Mumbai', state: 'Maharashtra', street: 'Central Station Road' },
      routes: [{ routeId: 'route_001', sequence: 1 }],
      amenities: { hasSeating: true, hasShelter: true },
      isActive: true
    });

    this.busStops.set('stop_002', {
      _id: 'stop_002',
      stopId: 'stop_002', 
      name: 'Dadar Bus Terminal',
      location: { lat: 19.0178, lng: 72.8478 },
      address: { city: 'Mumbai', state: 'Maharashtra', street: 'Dadar Station Road' },
      routes: [{ routeId: 'route_001', sequence: 2 }],
      amenities: { hasSeating: true, hasShelter: true },
      isActive: true
    });

    // Sample bus
    this.buses.set('BUS_001', {
      _id: 'bus_001',
      busId: 'BUS_001',
      routeId: 'route_001',
      currentLocation: { lat: 19.0760, lng: 72.8777, timestamp: new Date() },
      currentStatus: { status: 'stopped', currentPassengers: 0 },
      busInfo: { capacity: { total: 50 }, registrationNumber: 'MH01AB1234' },
      isActive: true,
      isOnline: false,
      getOccupancyPercentage: function() { return Math.round((this.currentStatus.currentPassengers / 50) * 100); }
    });

    console.log('Mock database initialized with sample data');
  }

  // Mock methods for different collections
  findDriverByCredentials(driverId, password) {
    // For demo, accept any driver with specific credentials
    if (driverId === 'DRIVER_001' && password === 'password123') {
      const driver = {
        _id: 'driver_001',
        driverId: 'DRIVER_001',
        name: { firstName: 'John', lastName: 'Doe' },
        contactInfo: { phone: '+91-9876543210' },
        currentBus: { status: 'off-duty' },
        performance: { totalTrips: 150, averageRating: 4.2, onTimePercentage: 85 },
        isActive: true,
        isOnline: true,
        currentLocation: { lat: 19.0760, lng: 72.8777, timestamp: new Date() }
      };
      this.drivers.set('driver_001', driver);
      return driver;
    }
    return null;
  }

  findUserByCredentials(email, password) {
    // For demo, accept any user with specific credentials
    if (email === 'user@example.com' && password === 'password123') {
      const user = {
        _id: 'user_001',
        userId: 'USER_001',
        username: 'testuser',
        email: 'user@example.com',
        currentLocation: { lat: 19.0760, lng: 72.8777, timestamp: new Date() },
        isActive: true
      };
      this.users.set('user_001', user);
      return user;
    }
    return null;
  }

  findCitiesByName(name, limit = 10) {
    const results = [];
    for (const city of this.cities.values()) {
      if (city.name.toLowerCase().includes(name.toLowerCase())) {
        results.push(city);
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  findBusStopsByCity(cityName, limit = 50) {
    const results = [];
    for (const stop of this.busStops.values()) {
      if (stop.address.city.toLowerCase().includes(cityName.toLowerCase())) {
        results.push(stop);
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  findNearbyBusStops(lat, lng, radius) {
    // Simple distance calculation for demo
    const results = [];
    for (const stop of this.busStops.values()) {
      const distance = this.calculateDistance(lat, lng, stop.location.lat, stop.location.lng);
      if (distance <= radius / 1000) { // Convert meters to km
        results.push({
          ...stop,
          distance: Math.round(distance * 1000) // Distance in meters
        });
      }
    }
    return results.sort((a, b) => a.distance - b.distance);
  }

  findBusesByRoute(routeId) {
    const results = [];
    for (const bus of this.buses.values()) {
      if (bus.routeId === routeId) {
        results.push(bus);
      }
    }
    return results;
  }

  updateBusLocation(busId, location) {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.currentLocation = { ...location, timestamp: new Date() };
      bus.isOnline = true;
      return bus;
    }
    return null;
  }

  updateDriverShift(driverId, status, busId = null) {
    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.currentBus = {
        status: status,
        busId: busId,
        shiftStart: status === 'on-duty' ? new Date() : driver.currentBus?.shiftStart,
        shiftEnd: status === 'off-duty' ? new Date() : null
      };
      return driver;
    }
    return null;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Analytics methods
  getBusAnalytics() {
    const totalBuses = this.buses.size;
    const onlineBuses = Array.from(this.buses.values()).filter(bus => bus.isOnline).length;
    const totalDrivers = this.drivers.size;
    const onlineDrivers = Array.from(this.drivers.values()).filter(driver => driver.isOnline).length;

    return {
      totalBuses,
      totalDrivers,
      totalRoutes: this.routes.size,
      totalUsers: this.users.size,
      totalBusStops: this.busStops.size,
      totalCities: this.cities.size,
      onlineBuses,
      onlineDrivers,
      activeBuses: onlineBuses
    };
  }
}

module.exports = new MockDatabase();
