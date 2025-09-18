const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String
  },
  currentLocation: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    favoriteRoutes: [{
      routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
      },
      alias: String
    }],
    favoriteBusStops: [{
      stopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusStop'
      },
      alias: String
    }],
    notificationSettings: {
      busArrivalNotifications: {
        type: Boolean,
        default: true
      },
      delayNotifications: {
        type: Boolean,
        default: true
      },
      routeChangeNotifications: {
        type: Boolean,
        default: true
      }
    }
  },
  // Track user's journey
  currentTrip: {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    startStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    endStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    startTime: Date,
    status: {
      type: String,
      enum: ['waiting', 'onboard', 'completed'],
      default: 'waiting'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries on user location
userSchema.index({ currentLocation: '2dsphere' });

// Method to calculate distance to a point
userSchema.methods.distanceTo = function(lat, lng) {
  if (!this.currentLocation.lat || !this.currentLocation.lng) {
    return null;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.currentLocation.lat) * Math.PI / 180;
  const dLng = (lng - this.currentLocation.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.currentLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to update location
userSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    lat,
    lng,
    timestamp: new Date()
  };
  return this.save();
};

// Static method to find nearby users
userSchema.statics.findNearby = function(lat, lng, maxDistance = 1000) {
  return this.find({
    'currentLocation.lat': { $exists: true },
    'currentLocation.lng': { $exists: true },
    currentLocation: {
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

module.exports = mongoose.model('User', userSchema);
