// Bus Tracking API Integration
// This file handles communication between the frontend and backend APIs

const API_BASE_URL = window.location.origin + '/api';
const SOCKET_URL = window.location.origin;

class BusTrackingAPI {
    constructor() {
        this.socket = null;
        this.initializeSocket();
    }

    // Initialize Socket.io connection
    initializeSocket() {
        if (typeof io !== 'undefined') {
            this.socket = io(SOCKET_URL);
            
            this.socket.on('connect', () => {
                console.log('Connected to real-time tracking server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from tracking server');
            });

            // Listen for real-time bus location updates
            this.socket.on('busLocationUpdate', (data) => {
                this.handleBusLocationUpdate(data);
            });

            // Listen for route updates
            this.socket.on('routeBusUpdate', (data) => {
                this.handleRouteUpdate(data);
            });

            // Listen for emergency alerts
            this.socket.on('emergencyAlert', (data) => {
                this.handleEmergencyAlert(data);
            });
        }
    }

    // API Methods for Bus Tracking

    // Get all buses
    async getAllBuses() {
        try {
            const response = await fetch(`${API_BASE_URL}/buses`);
            if (response.ok) {
                return await response.json();
            } else {
                console.warn('Failed to fetch buses, using mock data');
                return this.getMockBuses();
            }
        } catch (error) {
            console.warn('API not available, using mock data:', error);
            return this.getMockBuses();
        }
    }

    // Get bus by ID
    async getBus(busId) {
        try {
            const response = await fetch(`${API_BASE_URL}/buses/${busId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching bus:', error);
        }
        return null;
    }

    // Get all routes
    async getRoutes() {
        try {
            const response = await fetch(`${API_BASE_URL}/routes`);
            if (response.ok) {
                return await response.json();
            } else {
                console.warn('Failed to fetch routes, using mock data');
                return this.getMockRoutes();
            }
        } catch (error) {
            console.warn('API not available, using mock data:', error);
            return this.getMockRoutes();
        }
    }

    // Get bus stops
    async getBusStops() {
        try {
            const response = await fetch(`${API_BASE_URL}/bus-stops`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching bus stops:', error);
        }
        return [];
    }

    // Get nearby bus stops
    async getNearbyBusStops(lat, lng, radius = 1000) {
        try {
            const response = await fetch(`${API_BASE_URL}/bus-stops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching nearby bus stops:', error);
        }
        return [];
    }

    // Search buses
    async searchBuses(from, to) {
        try {
            const response = await fetch(`${API_BASE_URL}/tracking/search-buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error searching buses:', error);
        }
        return [];
    }

    // Get real-time bus information
    async getBusRealTimeInfo(busId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tracking/bus/${busId}/realtime`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching real-time bus info:', error);
        }
        return null;
    }

    // Socket.io Methods

    // Join bus tracking room
    joinBusTracking(busId) {
        if (this.socket) {
            this.socket.emit('joinBusTracking', busId);
        }
    }

    // Leave bus tracking room
    leaveBusTracking(busId) {
        if (this.socket) {
            this.socket.emit('leaveBusTracking', busId);
        }
    }

    // Join route tracking room
    joinRouteTracking(routeId) {
        if (this.socket) {
            this.socket.emit('joinRouteTracking', routeId);
        }
    }

    // Update user location
    updateUserLocation(location) {
        if (this.socket) {
            this.socket.emit('userLocationUpdate', {
                userId: this.generateUserId(),
                location: location
            });
        }
    }

    // Request bus arrival estimate
    requestBusArrival(busStopId) {
        if (this.socket) {
            this.socket.emit('requestBusArrival', {
                busStopId: busStopId,
                userId: this.generateUserId()
            });
        }
    }

    // Event Handlers

    handleBusLocationUpdate(data) {
        // Update bus location on map
        if (window.updateBusLocation) {
            window.updateBusLocation(data);
        }
        
        // Trigger custom event for other components
        const event = new CustomEvent('busLocationUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleRouteUpdate(data) {
        // Handle route updates
        const event = new CustomEvent('routeUpdate', { detail: data });
        window.dispatchEvent(event);
    }

    handleEmergencyAlert(data) {
        // Show emergency alert notification
        this.showNotification('Emergency Alert', data.message, 'error');
        
        const event = new CustomEvent('emergencyAlert', { detail: data });
        window.dispatchEvent(event);
    }

    // Utility Methods

    generateUserId() {
        if (!this.userId) {
            this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        }
        return this.userId;
    }

    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#4f46e5'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Mock Data Fallbacks

    getMockBuses() {
        const routes = ['R1', 'R2', 'R3', 'E1', 'E2', 'L1', 'L2', 'L3'];
        const destinations = ['Central Station', 'Airport', 'University', 'Tech Park', 'Shopping Mall', 'Hospital'];
        const statuses = ['active', 'delayed', 'stopped'];
        
        const buses = [];
        for (let i = 1; i <= 20; i++) {
            buses.push({
                id: `BUS${String(i).padStart(3, '0')}`,
                route: routes[Math.floor(Math.random() * routes.length)],
                destination: destinations[Math.floor(Math.random() * destinations.length)],
                lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                speed: Math.floor(Math.random() * 60) + 10,
                direction: Math.floor(Math.random() * 360),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                capacity: Math.floor(Math.random() * 100),
                driver: `Driver ${i}`,
                nextStops: this.getMockNextStops(),
                type: i <= 5 ? 'express' : (i <= 15 ? 'local' : 'regular')
            });
        }
        return buses;
    }

    getMockNextStops() {
        const stops = ['Main Square', 'City Center', 'Park Avenue', 'Station Road', 'Market Street'];
        const nextStops = [];
        for (let i = 0; i < 3; i++) {
            nextStops.push({
                name: stops[Math.floor(Math.random() * stops.length)],
                eta: `${Math.floor(Math.random() * 15) + 1} min`
            });
        }
        return nextStops;
    }

    getMockRoutes() {
        return [
            {
                id: '101',
                name: 'Downtown - Airport Express',
                type: 'express',
                stops: 25,
                duration: 45,
                frequency: 15,
                fare: 50,
                status: 'active'
            },
            {
                id: '202', 
                name: 'City Center Circular',
                type: 'local',
                stops: 32,
                duration: 60,
                frequency: 20,
                fare: 30,
                status: 'active'
            },
            {
                id: '303',
                name: 'North-South Night Service',
                type: 'night',
                stops: 18,
                duration: 55,
                frequency: 45,
                fare: 40,
                status: 'delayed'
            }
        ];
    }
}

// Initialize the API when the page loads
let busTrackingAPI;

document.addEventListener('DOMContentLoaded', () => {
    busTrackingAPI = new BusTrackingAPI();
    
    // Make API available globally
    window.busTrackingAPI = busTrackingAPI;
    
    console.log('Bus Tracking API initialized');
});
