const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  stopId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
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
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    }
  },
  // Routes that use this stop
  routes: [{
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    sequence: {
      type: Number,
      required: true
    }
  }],
  // External API data
  externalData: {
    googlePlaceId: String,
    osmId: String,
    transitApiId: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Accessibility and amenities
  amenities: {
    hasSeating: {
      type: Boolean,
      default: false
    },
    hasShelter: {
      type: Boolean,
      default: false
    },
    isWheelchairAccessible: {
      type: Boolean,
      default: false
    },
    hasRealTimeDisplay: {
      type: Boolean,
      default: false
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
busStopSchema.index({ location: '2dsphere' });

// Index for route queries
busStopSchema.index({ 'routes.routeId': 1 });

// Method to calculate distance to another point
busStopSchema.methods.distanceTo = function(lat, lng) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.location.lat) * Math.PI / 180;
  const dLng = (lng - this.location.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.location.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Static method to find nearby stops
busStopSchema.statics.findNearby = function(lat, lng, maxDistance = 1000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance // meters
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('BusStop', busStopSchema);
