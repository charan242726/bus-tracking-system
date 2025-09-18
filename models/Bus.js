const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
    unique: true
  },
  // Bus details
  busInfo: {
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    model: String,
    manufacturer: String,
    year: Number,
    capacity: {
      seated: {
        type: Number,
        default: 30
      },
      standing: {
        type: Number,
        default: 20
      },
      total: {
        type: Number,
        default: 50
      }
    },
    amenities: {
      hasAC: {
        type: Boolean,
        default: false
      },
      hasWiFi: {
        type: Boolean,
        default: false
      },
      hasUSBCharging: {
        type: Boolean,
        default: false
      },
      isWheelchairAccessible: {
        type: Boolean,
        default: false
      }
    }
  },
  // Current assignment
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  // Real-time location and status
  currentLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    accuracy: Number, // GPS accuracy in meters
    speed: Number, // km/h
    heading: Number // degrees (0-360)
  },
  // Current status and passenger info
  currentStatus: {
    status: {
      type: String,
      enum: ['running', 'stopped', 'maintenance', 'out-of-service', 'delayed'],
      default: 'stopped'
    },
    nextStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    estimatedArrival: Date,
    currentPassengers: {
      type: Number,
      default: 0,
      min: 0
    },
    lastStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    },
    lastStopTime: Date
  },
  // Trip information
  currentTrip: {
    tripId: String,
    startTime: Date,
    estimatedEndTime: Date,
    routeProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
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

// Indexes for efficient queries
busSchema.index({ currentLocation: '2dsphere' });
busSchema.index({ routeId: 1 });
busSchema.index({ driverId: 1 });
busSchema.index({ 'currentStatus.status': 1 });
busSchema.index({ isActive: 1, isOnline: 1 });

// Method to update location with additional tracking data
busSchema.methods.updateLocation = function(lat, lng, options = {}) {
  this.currentLocation = {
    lat,
    lng,
    timestamp: new Date(),
    accuracy: options.accuracy || null,
    speed: options.speed || null,
    heading: options.heading || null
  };
  this.isOnline = true;
  return this.save();
};

// Method to update passenger count
busSchema.methods.updatePassengerCount = function(count) {
  const maxCapacity = this.busInfo?.capacity?.total || 50;
  this.currentStatus.currentPassengers = Math.min(count, maxCapacity);
  return this.save();
};

// Method to start trip
busSchema.methods.startTrip = function(tripId) {
  this.currentTrip = {
    tripId: tripId || `trip_${Date.now()}`,
    startTime: new Date(),
    routeProgress: 0
  };
  this.currentStatus.status = 'running';
  this.isOnline = true;
  return this.save();
};

// Method to end trip
busSchema.methods.endTrip = function() {
  if (this.currentTrip) {
    this.currentTrip.routeProgress = 100;
  }
  this.currentStatus.status = 'stopped';
  return this.save();
};

// Method to calculate occupancy percentage
busSchema.methods.getOccupancyPercentage = function() {
  const capacity = this.busInfo?.capacity?.total || 50;
  const passengers = this.currentStatus?.currentPassengers || 0;
  return Math.round((passengers / capacity) * 100);
};

// Static method to find nearby buses
busSchema.statics.findNearby = function(lat, lng, maxDistance = 5000) {
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
  }).populate('routeId driverId');
};

// Static method to find available buses
busSchema.statics.findAvailable = function() {
  return this.find({
    'currentStatus.status': { $in: ['stopped', 'running'] },
    isActive: true
  }).populate('routeId driverId');
};

module.exports = mongoose.model('Bus', busSchema);
