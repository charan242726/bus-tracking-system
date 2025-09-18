const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  // Current bus assignment
  currentBus: {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    shiftStart: Date,
    shiftEnd: Date,
    status: {
      type: String,
      enum: ['on-duty', 'off-duty', 'break', 'emergency'],
      default: 'off-duty'
    }
  },
  // Real-time location tracking
  currentLocation: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    accuracy: Number, // GPS accuracy in meters
    speed: Number, // km/h
    heading: Number // degrees (0-360)
  },
  // Driver credentials and certifications
  credentials: {
    licenseNumber: {
      type: String,
      required: true
    },
    licenseClass: String,
    licenseExpiry: Date,
    medicalCertificate: {
      number: String,
      expiry: Date,
      isValid: Boolean
    }
  },
  // Work history and ratings
  performance: {
    totalTrips: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    onTimePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastPerformanceUpdate: {
      type: Date,
      default: Date.now
    }
  },
  // Emergency and safety features
  emergencyInfo: {
    panicButtonPressed: {
      type: Boolean,
      default: false
    },
    lastPanicTime: Date,
    sosContacts: [{
      name: String,
      phone: String,
      type: {
        type: String,
        enum: ['supervisor', 'emergency', 'family']
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ 'currentBus.busId': 1 });
driverSchema.index({ 'currentBus.routeId': 1 });

// Method to update location
driverSchema.methods.updateLocation = function(lat, lng, options = {}) {
  this.currentLocation = {
    lat,
    lng,
    timestamp: new Date(),
    accuracy: options.accuracy || null,
    speed: options.speed || null,
    heading: options.heading || null
  };
  return this.save();
};

// Method to start shift
driverSchema.methods.startShift = function(busId, routeId) {
  this.currentBus = {
    busId,
    routeId,
    shiftStart: new Date(),
    status: 'on-duty'
  };
  this.isOnline = true;
  return this.save();
};

// Method to end shift
driverSchema.methods.endShift = function() {
  if (this.currentBus) {
    this.currentBus.shiftEnd = new Date();
    this.currentBus.status = 'off-duty';
  }
  this.isOnline = false;
  return this.save();
};

// Method to trigger panic button
driverSchema.methods.triggerPanic = function() {
  this.emergencyInfo.panicButtonPressed = true;
  this.emergencyInfo.lastPanicTime = new Date();
  return this.save();
};

// Static method to find nearby drivers
driverSchema.statics.findNearby = function(lat, lng, maxDistance = 5000) {
  return this.find({
    'currentLocation.lat': { $exists: true },
    'currentLocation.lng': { $exists: true },
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    isOnline: true
  });
};

// Static method to find available drivers
driverSchema.statics.findAvailable = function() {
  return this.find({
    'currentBus.status': { $in: ['off-duty', 'break'] },
    isActive: true
  });
};

module.exports = mongoose.model('Driver', driverSchema);
