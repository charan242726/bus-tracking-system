// Backend Integration

const API_URL = 'http://localhost:3000/api';
let socket;

// Initialize Socket.io connection
function initializeSocket() {
    socket = io('http://localhost:3000', {
        transports: ['websocket'],
        autoConnect: true
    });

    socket.on('connect', () => {
        console.log('Connected to Socket.io server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
    });

    // Listen for real-time bus location updates
    socket.on('busLocationUpdate', (data) => {
        updateBusPosition(data);
    });

    socket.on('locationUpdate', (data) => {
        updateBusPosition(data);
    });

    // Join tracking rooms for our buses
    const busIds = ['101', '204B'];
    busIds.forEach(busId => {
        socket.emit('joinBusTracking', busId);
    });
}

// Update bus position on the map
function updateBusPosition(data) {
    const { busId, location } = data;
    
    if (location) {
        // Update the map marker
        window.mapFunctions.updateBusPosition(data);
        
        // Update ETA and next stop info based on location
        updateBusInfo(busId, location);
    }
}

// Convert latitude and longitude to relative positions
// This is a simplified example - in a real app, you'd use proper map coordinates
function convertLatLngToRelative(lat, lng) {
    // This is a placeholder implementation
    // You should implement proper coordinate conversion based on your map bounds
    const x = ((lng + 180) / 360) * 100; // Convert -180/180 to 0-100
    const y = ((90 - lat) / 180) * 100;  // Convert -90/90 to 0-100
    return { x, y };
}

// Update bus information (ETA, next stop, etc.)
async function updateBusInfo(busId, location) {
    try {
        const response = await fetch(`${API_URL}/bus/${busId}/location`);
        const data = await response.json();
        
        if (data.success) {
            const nextStopEl = document.getElementById(`next-stop-${busId}`);
            const etaEl = document.getElementById(`eta-${busId}`);
            
            if (nextStopEl && data.data.nextStop) {
                nextStopEl.textContent = data.data.nextStop;
            }
            
            if (etaEl && data.data.eta) {
                etaEl.textContent = `${data.data.eta} min`;
            }
        }
    } catch (error) {
        console.error(`Error updating bus info for ${busId}:`, error);
    }
}

// Initialize real-time tracking
document.addEventListener('DOMContentLoaded', () => {
    // Load the Socket.io client script
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    script.onload = initializeSocket;
    document.head.appendChild(script);
    
    // Start initial bus tracking
    const busIds = ['101', '204B'];
    busIds.forEach(async (busId) => {
        try {
            const response = await fetch(`${API_URL}/bus/${busId}/location`);
            const data = await response.json();
            
            if (data.success) {
                updateBusPosition({
                    busId,
                    location: data.data.location
                });
            }
        } catch (error) {
            console.error(`Error fetching initial position for bus ${busId}:`, error);
        }
    });
});

// Search functionality with backend integration
async function searchBusRoute(query) {
    try {
        // You would need to implement this endpoint in your backend
        const response = await fetch(`${API_URL}/routes/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const route = data.data[0]; // Get first matching route
            const targetCardId = `card-${route.busId}`;
            const targetCard = document.getElementById(targetCardId);

            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                selectBus(`bus-${route.busId}`);
            } else {
                alert('Route not found.');
            }
        } else {
            alert('No matching routes found.');
        }
    } catch (error) {
        console.error('Error searching routes:', error);
        alert('Error searching routes. Please try again.');
    }
}

// Export functions for use in index.html
window.busTracking = {
    searchBusRoute,
    initializeSocket,
    updateBusPosition,
    updateBusInfo
};