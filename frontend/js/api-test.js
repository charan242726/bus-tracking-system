// API Integration Test Script
// Run this in the browser console to test API endpoints

console.log('🚌 Bus Tracking API Integration Test');
console.log('=====================================');

// Test configuration
const API_BASE_URL = window.location.origin + '/api';

async function runAPITests() {
    console.log('\n🔧 Starting API Tests...\n');
    
    // Test 1: Health Check
    console.log('1. Testing API Health Check...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Health check passed:', data);
        } else {
            console.log('   ❌ Health check failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Health check error:', error.message);
    }
    
    // Test 2: Get All Buses
    console.log('\n2. Testing Get All Buses...');
    try {
        const response = await fetch(`${API_BASE_URL}/buses`);
        if (response.ok) {
            const buses = await response.json();
            console.log(`   ✅ Retrieved ${buses.length} buses`);
            if (buses.length > 0) {
                console.log('   Sample bus:', buses[0]);
            }
        } else {
            console.log('   ❌ Get buses failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Get buses error:', error.message);
    }
    
    // Test 3: Get All Routes
    console.log('\n3. Testing Get All Routes...');
    try {
        const response = await fetch(`${API_BASE_URL}/routes`);
        if (response.ok) {
            const routes = await response.json();
            console.log(`   ✅ Retrieved ${routes.length} routes`);
            if (routes.length > 0) {
                console.log('   Sample route:', routes[0]);
            }
        } else {
            console.log('   ❌ Get routes failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Get routes error:', error.message);
    }
    
    // Test 4: Get Bus Stops
    console.log('\n4. Testing Get Bus Stops...');
    try {
        const response = await fetch(`${API_BASE_URL}/bus-stops`);
        if (response.ok) {
            const stops = await response.json();
            console.log(`   ✅ Retrieved ${stops.length} bus stops`);
            if (stops.length > 0) {
                console.log('   Sample stop:', stops[0]);
            }
        } else {
            console.log('   ❌ Get bus stops failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Get bus stops error:', error.message);
    }
    
    // Test 5: Search Buses
    console.log('\n5. Testing Search Buses...');
    try {
        const response = await fetch(`${API_BASE_URL}/tracking/search-buses?from=Central&to=Airport`);
        if (response.ok) {
            const results = await response.json();
            console.log(`   ✅ Found ${results.length} buses for Central to Airport`);
            if (results.length > 0) {
                console.log('   Sample result:', results[0]);
            }
        } else {
            console.log('   ❌ Search buses failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Search buses error:', error.message);
    }
    
    // Test 6: Test WebSocket Connection
    console.log('\n6. Testing WebSocket Connection...');
    try {
        if (typeof io !== 'undefined') {
            const socket = io();
            
            socket.on('connect', () => {
                console.log('   ✅ WebSocket connected successfully');
                
                // Test joining a room
                socket.emit('joinBusTracking', 'BUS001');
                console.log('   ✅ Joined bus tracking room for BUS001');
                
                // Disconnect after test
                setTimeout(() => {
                    socket.disconnect();
                    console.log('   ✅ WebSocket disconnected');
                }, 2000);
            });
            
            socket.on('connect_error', (error) => {
                console.log('   ❌ WebSocket connection error:', error);
            });
        } else {
            console.log('   ❌ Socket.io not loaded');
        }
    } catch (error) {
        console.log('   ❌ WebSocket test error:', error.message);
    }
    
    // Test 7: Test BusTrackingAPI Integration
    console.log('\n7. Testing BusTrackingAPI Integration...');
    setTimeout(async () => {
        try {
            if (window.busTrackingAPI) {
                console.log('   ✅ BusTrackingAPI loaded successfully');
                
                // Test getting buses through API wrapper
                const buses = await window.busTrackingAPI.getAllBuses();
                console.log(`   ✅ API wrapper returned ${buses.length} buses`);
                
                // Test getting routes through API wrapper
                const routes = await window.busTrackingAPI.getRoutes();
                console.log(`   ✅ API wrapper returned ${routes.length} routes`);
                
                // Test user location update
                if (window.busTrackingAPI.updateUserLocation) {
                    window.busTrackingAPI.updateUserLocation({ lat: 28.6139, lng: 77.2090 });
                    console.log('   ✅ User location updated through API');
                }
                
            } else {
                console.log('   ❌ BusTrackingAPI not loaded');
            }
        } catch (error) {
            console.log('   ❌ BusTrackingAPI test error:', error.message);
        }
        
        console.log('\n🏁 API Tests Completed');
        console.log('=====================================');
    }, 3000); // Wait for API to initialize
}

// Auto-run tests when page loads (if not in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAPITests, 1000);
    });
}

// Export test function for manual execution
window.runAPITests = runAPITests;

console.log('📝 API Test Script Loaded');
console.log('Run "runAPITests()" in console to test API integration');
