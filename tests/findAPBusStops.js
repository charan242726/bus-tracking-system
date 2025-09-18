const axios = require('axios');
require('dotenv').config();

async function findBusStopsInAP(location) {
    try {
        // Using Google Maps Places API to find bus stops
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const query = encodeURIComponent(location + ' bus stand Andhra Pradesh');
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${googleApiKey}`;

        const response = await axios.get(url);
        const places = response.data.results;

        console.log(`\nFound ${places.length} bus stops near ${location}:\n`);
        
        places.forEach((place, index) => {
            console.log(`${index + 1}. ${place.name}`);
            console.log(`   Rating: ${place.rating || 'No rating'} (${place.user_ratings_total || 0} reviews)`);
            console.log(`   Address: ${place.formatted_address}`);
            console.log(`   Location: ${place.geometry.location.lat}°N, ${place.geometry.location.lng}°E`);
            if (place.opening_hours) {
                console.log(`   Open now: ${place.opening_hours.open_now ? 'Yes' : 'No'}`);
            }
            console.log('');
        });

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data.error_message || error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        console.log('\nTo use this script:');
        console.log('1. Get a Google Maps API key from https://console.cloud.google.com/');
        console.log('2. Create a .env file in the root directory');
        console.log('3. Add your API key to .env: GOOGLE_MAPS_API_KEY=your_api_key_here');
    }
}

// Alternative function using OpenStreetMap (no API key required)
async function findBusStopsUsingOSM(location) {
    try {
        // First, get coordinates for the location
        const searchQuery = encodeURIComponent(location + ', Andhra Pradesh, India');
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`;
        
        const locationRes = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'BusStopFinder/1.0' }
        });

        if (locationRes.data.length === 0) {
            console.log(`Location '${location}' not found in Andhra Pradesh`);
            return;
        }

        const { lat, lon } = locationRes.data[0];
        
        // Now search for bus stops around these coordinates
        const overpassUrl = `https://overpass-api.de/api/interpreter`;
        const query = `
        [out:json][timeout:25];
        (
          node["highway"="bus_stop"](around:5000,${lat},${lon});
          way["amenity"="bus_station"](around:5000,${lat},${lon});
          relation["amenity"="bus_station"](around:5000,${lat},${lon});
        );
        out body;
        >;
        out skel qt;`;

        const response = await axios.post(overpassUrl, query);
        const busStops = response.data.elements.filter(elem => 
            elem.tags && (elem.tags.highway === 'bus_stop' || elem.tags.amenity === 'bus_station')
        );

        if (busStops.length === 0) {
            console.log(`\nNo bus stops found near ${location}. Try searching a nearby major city.`);
            return;
        }

        console.log(`\nFound ${busStops.length} bus stops near ${location}:\n`);
        
        busStops.forEach((stop, index) => {
            const name = stop.tags ? (stop.tags.name || 'Unnamed Bus Stop') : 'Unnamed Bus Stop';
            const type = stop.tags.highway === 'bus_stop' ? 'Bus Stop' : 'Bus Station';
            
            console.log(`${index + 1}. ${name}`);
            console.log(`   Type: ${type}`);
            if (stop.lat && stop.lon) {
                console.log(`   Location: ${stop.lat.toFixed(4)}°N, ${stop.lon.toFixed(4)}°E`);
            }
            if (stop.tags.operator) {
                console.log(`   Operator: ${stop.tags.operator}`);
            }
            if (stop.tags.route_ref) {
                console.log(`   Routes: ${stop.tags.route_ref}`);
            }
            if (stop.tags.network) {
                console.log(`   Network: ${stop.tags.network}`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Get location from command line argument
const location = process.argv[2];

if (!location) {
    console.log('Usage:');
    console.log('1. Using Google Maps (requires API key):');
    console.log('   node findAPBusStops.js "city or area name"');
    console.log('2. Using OpenStreetMap (no API key needed):');
    console.log('   node findAPBusStops.js "city or area name" osm');
    process.exit(1);
}

// Check which API to use
if (process.argv[3] === 'osm') {
    findBusStopsUsingOSM(location);
} else {
    findBusStopsInAP(location);
}