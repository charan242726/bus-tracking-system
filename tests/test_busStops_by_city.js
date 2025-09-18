const axios = require('axios');

// Mock data for testing without database
const mockBusStops = [
  { 
    name: 'RTC Complex Visakhapatnam',
    stopId: 'VIZAG001',
    address: { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    location: { lat: 17.7244, lng: 83.3004 }
  },
  {
    name: 'Pandit Nehru Bus Station',
    stopId: 'VJA001',
    address: { city: 'Vijayawada', state: 'Andhra Pradesh' },
    location: { lat: 16.5062, lng: 80.6480 }
  },
  {
    name: 'Tirupati Central Bus Stand',
    stopId: 'TPT001',
    address: { city: 'Tirupati', state: 'Andhra Pradesh' },
    location: { lat: 13.6288, lng: 79.4192 }
  },
  {
    name: 'NTR Bus Stand Guntur',
    stopId: 'GNT001',
    address: { city: 'Guntur', state: 'Andhra Pradesh' },
    location: { lat: 16.3067, lng: 80.4365 }
  },
  {
    name: 'Nellore Bus Stand',
    stopId: 'NLR001',
    address: { city: 'Nellore', state: 'Andhra Pradesh' },
    location: { lat: 14.4426, lng: 79.9865 }
  }
];

// Usage: node tests/test_busStops_by_city.js <city1> [city2] [...]
// Example: node tests/test_busStops_by_city.js "Visakhapatnam" "Vijayawada"

async function testCities() {
  const cities = process.argv.slice(2);
  if (cities.length === 0) {
    console.error('Usage: node tests/test_busStops_by_city.js <city1> [city2] [...]');
    process.exit(1);
  }

  for (const city of cities) {
    console.log(`\nSearching bus stops for city: ${city}`);
    // Filter mock data case-insensitively
    const matches = mockBusStops.filter(stop => 
      stop.address.city.toLowerCase() === city.toLowerCase()
    );
    
    console.log(`Found: ${matches.length} results`);
    if (matches.length) {
      matches.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} - ${s.address.city}`);
        console.log(`     Location: ${s.location.lat}, ${s.location.lng}`);
        console.log(`     Stop ID: ${s.stopId}`);
      });
    } else {
      console.log('  No stops found in this city');
    }
  }
}

testCities();
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node tests/test_busStops_by_city.js <serverBaseUrl> <city1> [city2] [...]');
    process.exit(1);
  }

  const baseUrl = args[0].replace(/\/$/, '');
  const cities = args.slice(1);

  for (const city of cities) {
    try {
      console.log(`\nRequesting bus stops for city: ${city}`);
      const res = await axios.get(`${baseUrl}/api/bus-stops`, {
        params: { city }
      });

      console.log(`Status: ${res.status}`);
      console.log(`Found: ${Array.isArray(res.data.data) ? res.data.data.length : 'unknown'} results`);
      // Print first 3 stops
      if (Array.isArray(res.data.data) && res.data.data.length) {
        const subset = res.data.data.slice(0, 3);
        subset.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.name} - ${s.address && s.address.city ? s.address.city : 'no-city'}`);
        });
      } else {
        console.log('  No stops returned');
      }
    } catch (err) {
      if (err.response) {
        console.error(`  Error ${err.response.status}:`, err.response.data);
      } else {
        console.error('  Request error:', err.message);
      }
    }
  }
}

testCities();
