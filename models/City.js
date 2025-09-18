const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  cityId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  },
  centerLocation: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  // City boundaries for geofencing
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: [[Number]] // Array of [lng, lat] coordinates
  },
  // Major bus terminals/stations in this city
  majorTerminals: [{
    name: String,
    location: {
      lat: Number,
      lng: Number
    },
    busStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    }
  }],
  // City statistics
  stats: {
    totalBusStops: {
      type: Number,
      default: 0
    },
    totalRoutes: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
citySchema.index({ centerLocation: '2dsphere' });
citySchema.index({ boundaries: '2dsphere' });
citySchema.index({ name: 'text', state: 'text' });

// Method to check if coordinates are within city boundaries
citySchema.methods.containsPoint = function(lat, lng) {
  if (!this.boundaries || !this.boundaries.coordinates) {
    // Fallback: check if within 25km of city center
    const distance = this.distanceToCenter(lat, lng);
    return distance <= 25; // 25km radius
  }
  
  // Use MongoDB's geoWithin query would be better, but this is a simple approximation
  return this.distanceToCenter(lat, lng) <= 25;
};

// Method to calculate distance to city center
citySchema.methods.distanceToCenter = function(lat, lng) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.centerLocation.lat) * Math.PI / 180;
  const dLng = (lng - this.centerLocation.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.centerLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Static method to find cities by name (fuzzy search)
citySchema.statics.findByName = function(name, limit = 10) {
  return this.find({
    $or: [
      { name: new RegExp(name, 'i') },
      { state: new RegExp(name, 'i') }
    ],
    isActive: true
  }).limit(limit);
};

module.exports = mongoose.model('City', citySchema);
