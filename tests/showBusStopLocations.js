const axios = require('axios');

async function getAddressFromCoordinates(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'BusStopLocator/1.0' }
        });
        return response.data.address;
    } catch (error) {
        return null;
    }
}

async function searchBusStops(location, options = {}) {
    try {
        const {
            radius = 5000,           // Search radius in meters
            type,                    // 'bus_station' or 'bus_stop'
            operator,                // e.g., 'APSRTC'
            hasWaitingArea = false,  // Filter stops with waiting areas
            hasTicketCounter = false // Filter stops with ticket counters
        } = options;

        // First, get coordinates for the search location
        const searchQuery = encodeURIComponent(location + ', Andhra Pradesh, India');
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`;
        
        const locationRes = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'BusStopLocator/1.0' }
        });

        if (locationRes.data.length === 0) {
            console.log(`\nLocation '${location}' not found in Andhra Pradesh`);
            return;
        }

        const { lat, lon } = locationRes.data[0];
        
        // Search for bus stops around these coordinates
        const overpassUrl = `https://overpass-api.de/api/interpreter`;
        // Build the Overpass query based on filters
        let queryParts = [];
        
        if (!type || type === 'bus_stop') {
            queryParts.push(`node["highway"="bus_stop"](around:${radius},${lat},${lon});`);
        }
        if (!type || type === 'bus_station') {
            queryParts.push(`way["amenity"="bus_station"](around:${radius},${lat},${lon});`);
            queryParts.push(`relation["amenity"="bus_station"](around:${radius},${lat},${lon});`);
        }

        const query = `
        [out:json][timeout:25];
        (
          ${queryParts.join('\n          ')}
        );
        out body;
        >;
        out skel qt;`;

        const response = await axios.post(overpassUrl, query);
        let busStops = response.data.elements.filter(elem => 
            elem.tags && (elem.tags.highway === 'bus_stop' || elem.tags.amenity === 'bus_station')
        );

        // Apply additional filters
        if (operator) {
            busStops = busStops.filter(stop => 
                stop.tags.operator && stop.tags.operator.toLowerCase().includes(operator.toLowerCase())
            );
        }

        if (hasWaitingArea) {
            busStops = busStops.filter(stop => 
                stop.tags.shelter === 'yes' || stop.tags.bench === 'yes'
            );
        }

        if (hasTicketCounter) {
            busStops = busStops.filter(stop => 
                stop.tags.ticket === 'yes' || stop.tags.amenity === 'bus_station'
            );
        }

        if (busStops.length === 0) {
            console.log(`\nNo bus stops found near ${location}. Try searching a nearby major city.`);
            return;
        }

        console.log(`\nFound ${busStops.length} bus stops near ${location}:\n`);
        
        // Process each bus stop
        for (const [index, stop] of busStops.entries()) {
            const name = stop.tags ? (stop.tags.name || 'Unnamed Bus Stop') : 'Unnamed Bus Stop';
            const type = stop.tags.highway === 'bus_stop' ? 'Bus Stop' : 'Bus Station';
            
            console.log(`${index + 1}. ${name}`);
            console.log(`   Type: ${type}`);
            
            if (stop.lat && stop.lon) {
                console.log(`   Location: ${stop.lat.toFixed(4)}°N, ${stop.lon.toFixed(4)}°E`);
                
                // Get detailed address
                const address = await getAddressFromCoordinates(stop.lat, stop.lon);
                if (address) {
                    console.log('   Address:');
                    if (address.road) console.log(`      Street: ${address.road}`);
                    if (address.suburb) console.log(`      Area: ${address.suburb}`);
                    if (address.city || address.town || address.village) {
                        console.log(`      City: ${address.city || address.town || address.village}`);
                    }
                    if (address.district) console.log(`      District: ${address.district}`);
                    if (address.postcode) console.log(`      PIN Code: ${address.postcode}`);
                    if (address.state) console.log(`      State: ${address.state}`);
                }
            }

            if (stop.tags.operator) {
                console.log(`   Operator: ${stop.tags.operator}`);
            }
            if (stop.tags.network) {
                console.log(`   Network: ${stop.tags.network}`);
            }
            if (stop.tags.route_ref) {
                console.log(`   Routes: ${stop.tags.route_ref}`);
            }
            
            // Calculate and show distance from search location
            if (stop.lat && stop.lon) {
                const distance = calculateDistance(lat, lon, stop.lat, stop.lon);
                console.log(`   Distance from search location: ${distance.toFixed(2)} km`);
            }
            
            console.log('');
        }
    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nUsage: node showBusStopLocations.js <location>');
        console.log('Example: node showBusStopLocations.js "Bhimavaram"');
    }
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Static sample data as fallback if API fails
const backupBusStopsData = [
    {
        name: 'APSRTC Bus Complex Bhimavaram',
        stopId: 'BMV001',
        address: {
            street: 'RTC Bus Complex Road',
            area: 'College Road',
            city: 'Bhimavaram',
            state: 'Andhra Pradesh',
            pincode: '534201'
        },
        location: {
            lat: 16.5449,
            lng: 81.5212
        },
        landmarks: ['SRKR Engineering College', 'Railway Station', 'Sai Baba Temple'],
        routes: ['Bhimavaram-Vijayawada Express', 'Bhimavaram-Rajahmundry', 'Bhimavaram-Visakhapatnam', 'Bhimavaram-Hyderabad'],
        type: 'Main Bus Complex',
        facilities: ['Ticket Counter', 'Waiting Room', 'Food Court', 'Parking']
    },
    {
        name: 'Bhimavaram City Bus Station',
        stopId: 'BMV002',
        address: {
            street: 'JNC Road',
            area: 'Town Center',
            city: 'Bhimavaram',
            state: 'Andhra Pradesh',
            pincode: '534201'
        },
        location: {
            lat: 16.5466,
            lng: 81.5209
        },
        landmarks: ['Municipal Office', 'District Court', 'Town Police Station'],
        routes: ['Bhimavaram-Narsapur', 'Bhimavaram-Palakollu', 'Bhimavaram-Tadepalligudem', 'Bhimavaram Local Routes'],
        type: 'City Bus Station',
        facilities: ['Ticket Counter', 'Basic Waiting Area']
    },
    {
        name: 'RTC Complex Visakhapatnam',
        stopId: 'VIZAG001',
        address: {
            street: 'Dwaraka Bus Station Road',
            area: 'Dondaparthy',
            city: 'Visakhapatnam',
            state: 'Andhra Pradesh',
            pincode: '530016'
        },
        location: {
            lat: 17.7244,
            lng: 83.3004
        },
        landmarks: ['Dwaraka Bus Station', 'Railway Station'],
        routes: ['Vizag-Vijayawada', 'Vizag-Hyderabad', 'Vizag-Chennai']
    },
    {
        name: 'Pandit Nehru Bus Station',
        stopId: 'VJA001',
        address: {
            street: 'Nehru Bus Station Road',
            area: 'Gandhi Nagar',
            city: 'Vijayawada',
            state: 'Andhra Pradesh',
            pincode: '520003'
        },
        location: {
            lat: 16.5062,
            lng: 80.6480
        },
        landmarks: ['Railway Station', 'Kanaka Durga Temple'],
        routes: ['Vijayawada-Hyderabad', 'Vijayawada-Chennai', 'Vijayawada-Bangalore']
    },
    {
        name: 'Tirupati Central Bus Stand',
        stopId: 'TPT001',
        address: {
            street: 'Bus Stand Road',
            area: 'Gandhi Road',
            city: 'Tirupati',
            state: 'Andhra Pradesh',
            pincode: '517501'
        },
        location: {
            lat: 13.6288,
            lng: 79.4192
        },
        landmarks: ['Railway Station', 'Sri Venkateswara Temple'],
        routes: ['Tirupati-Chennai', 'Tirupati-Bangalore', 'Tirupati-Vijayawada']
    },
    {
        name: 'NTR Bus Stand Guntur',
        stopId: 'GNT001',
        address: {
            street: 'NTR Bus Stand Road',
            area: 'Old Guntur',
            city: 'Guntur',
            state: 'Andhra Pradesh',
            pincode: '522001'
        },
        location: {
            lat: 16.3067,
            lng: 80.4365
        },
        landmarks: ['Railway Station', 'Gunta Grounds'],
        routes: ['Guntur-Vijayawada', 'Guntur-Hyderabad', 'Guntur-Chennai']
    },
    {
        name: 'Nellore Bus Stand',
        stopId: 'NLR001',
        address: {
            street: 'Grand Trunk Road',
            area: 'AC Nagar',
            city: 'Nellore',
            state: 'Andhra Pradesh',
            pincode: '524001'
        },
        location: {
            lat: 14.4426,
            lng: 79.9865
        },
        landmarks: ['Railway Station', 'Clock Tower'],
        routes: ['Nellore-Chennai', 'Nellore-Tirupati', 'Nellore-Vijayawada']
    }
];

async function searchOfflineStops(searchTerm) {
    // Case insensitive search in city names and landmarks (fallback function)
    const matches = backupBusStopsData.filter(stop => {
        const cityMatch = stop.address.city.toLowerCase().includes(searchTerm.toLowerCase());
        const landmarkMatch = stop.landmarks.some(landmark => 
            landmark.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return cityMatch || landmarkMatch;
    });

    if (matches.length === 0) {
        console.log('\nNo bus stops found matching your search in offline data.');
        return;
    }

    console.log(`\nFound ${matches.length} bus stops (from offline data):\n`);
    matches.forEach((stop, index) => {
        console.log(`${index + 1}. ${stop.name}`);
        console.log(`   Location: ${stop.location.lat}°N, ${stop.location.lng}°E`);
        console.log(`   Address: ${stop.address.street}, ${stop.address.area}`);
        console.log(`           ${stop.address.city}, ${stop.address.state} - ${stop.address.pincode}`);
        console.log(`   Stop ID: ${stop.stopId}`);
        console.log(`   Nearby Landmarks: ${stop.landmarks.join(', ')}`);
        console.log(`   Routes: ${stop.routes.join(', ')}`);
        console.log('');
    });
}

// Parse command line arguments
const args = process.argv.slice(2);
const searchTerm = args[0];

function printUsage() {
    console.log('Usage: node showBusStopLocations.js <location> [options]');
    console.log('\nOptions:');
    console.log('  --type=<type>          Filter by type: "bus_station" or "bus_stop"');
    console.log('  --radius=<meters>      Search radius in meters (default: 5000)');
    console.log('  --operator=<name>      Filter by operator (e.g., "APSRTC")');
    console.log('  --waiting-area         Show only stops with waiting areas');
    console.log('  --ticket-counter       Show only stops with ticket counters');
    console.log('\nExamples:');
    console.log('  node showBusStopLocations.js "Bhimavaram"');
    console.log('  node showBusStopLocations.js "Visakhapatnam" --type=bus_station');
    console.log('  node showBusStopLocations.js "Vijayawada" --radius=2000 --operator=APSRTC');
    console.log('  node showBusStopLocations.js "Guntur" --waiting-area --ticket-counter');
}

if (!searchTerm) {
    printUsage();
    process.exit(1);
}

// Parse options
const options = {};
for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--type=')) {
        options.type = arg.split('=')[1];
    } else if (arg.startsWith('--radius=')) {
        options.radius = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--operator=')) {
        options.operator = arg.split('=')[1];
    } else if (arg === '--waiting-area') {
        options.hasWaitingArea = true;
    } else if (arg === '--ticket-counter') {
        options.hasTicketCounter = true;
    }
}

// Try online search first, fallback to offline data if it fails
searchBusStops(searchTerm, options).catch(error => {
    console.log('\nFalling back to offline data due to API error...');
    searchOfflineStops(searchTerm);
});