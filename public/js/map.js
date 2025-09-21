let map;
let busMarkers = {};
let busRoutes = {};
let busStops = {};

// Custom bus icon for the map
const createBusIcon = (color) => {
    return L.divIcon({
        html: `<div class="bus-icon bg-${color}-500" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v5c0 .6.4 1 1 1h2"/>
                    <path d="M19 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                    <path d="M5 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                    <path d="M5 11V6c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5"/>
                    <path d="M15 9H9"/>
                </svg>
              </div>`,
        className: 'custom-bus-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

// Custom bus stop icon
const busStopIcon = L.divIcon({
    html: `<div style="width: 12px; height: 12px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%;"></div>`,
    className: 'custom-stop-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

function initializeMap() {
    // Initialize the map (centered on Bhimavaram, Andhra Pradesh)
    map = L.map('map').setView([16.5447, 81.5213], 14); // Bhimavaram coordinates

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize bus routes for Bhimavaram
    const sampleRoutes = {
        '101': {
            color: 'amber',
            stops: [
                { name: 'Bhimavaram Bus Station', coords: [16.5447, 81.5213] },
                { name: 'RTC Complex', coords: [16.5435, 81.5225] },
                { name: 'JKC College', coords: [16.5426, 81.5271] },
                { name: 'Gandhi Chowk', coords: [16.5463, 81.5289] },
                { name: 'SRKR Engineering College', coords: [16.5574, 81.5199] }
            ]
        },
        '204B': {
            color: 'indigo',
            stops: [
                { name: 'Bhimavaram Junction', coords: [16.5408, 81.5277] },
                { name: 'District Hospital', coords: [16.5465, 81.5251] },
                { name: 'Town Police Station', coords: [16.5482, 81.5212] },
                { name: 'DNR College', coords: [16.5515, 81.5234] }
            ]
        }
    };

    // Add routes and stops to the map
    Object.entries(sampleRoutes).forEach(([busId, routeData]) => {
        // Create route polyline
        const routeCoords = routeData.stops.map(stop => stop.coords);
        const routeLine = L.polyline(routeCoords, {
            color: `#${getColorHex(routeData.color)}`,
            weight: 4,
            opacity: 0.6
        }).addTo(map);
        busRoutes[busId] = routeLine;

        // Add bus stops
        routeData.stops.forEach(stop => {
            const marker = L.marker(stop.coords, { icon: busStopIcon })
                .bindPopup(stop.name)
                .addTo(map);
            if (!busStops[busId]) busStops[busId] = [];
            busStops[busId].push(marker);
        });

        // Add bus marker
        const busMarker = L.marker(routeCoords[0], {
            icon: createBusIcon(routeData.color)
        }).addTo(map);
        busMarkers[busId] = {
            marker: busMarker,
            currentStopIndex: 0,
            stops: routeData.stops
        };
    });

    // Fit map bounds to show all routes
    const allCoords = Object.values(sampleRoutes).flatMap(route => 
        route.stops.map(stop => stop.coords)
    );
    if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords));
    }
}

// Update bus position on the map
function updateBusPosition(data) {
    const { busId, location } = data;
    const busMarker = busMarkers[busId]?.marker;
    
    if (busMarker && location) {
        const latLng = [location.lat, location.lng];
        busMarker.setLatLng(latLng);
        
        // Highlight the nearest stop
        highlightNearestStop(busId, latLng);
    }
}

// Highlight the nearest bus stop
function highlightNearestStop(busId, busLatLng) {
    const stops = busStops[busId];
    if (!stops) return;

    let minDist = Infinity;
    let nearestStop = null;

    stops.forEach(stop => {
        const stopLatLng = stop.getLatLng();
        const dist = stopLatLng.distanceTo(L.latLng(busLatLng));
        if (dist < minDist) {
            minDist = dist;
            nearestStop = stop;
        }
    });

    // Update stop styling
    stops.forEach(stop => {
        const isNearest = stop === nearestStop;
        const icon = L.divIcon({
            html: `<div style="width: 12px; height: 12px; background-color: ${isNearest ? '#f59e0b' : '#3b82f6'}; border: 2px solid white; border-radius: 50%;"></div>`,
            className: 'custom-stop-icon',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
        stop.setIcon(icon);
    });
}

// Helper function to get color hex codes
function getColorHex(color) {
    const colors = {
        'amber': 'f59e0b',
        'indigo': '6366f1'
    };
    return colors[color] || '3b82f6';
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMap);

// Export functions for use in other modules
window.mapFunctions = {
    updateBusPosition,
    highlightNearestStop
};