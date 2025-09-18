const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  routeName: {
    type: String,
    required: true
  },
  routeType: {
    type: String,
    enum: ['local', 'intercity', 'express', 'deluxe'],
    default: 'local'
  },
  // City connections for intercity routes
  cities: {
    origin: {
      cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
      },
      name: String,
      majorTerminal: {
        name: String,
        location: {
          lat: Number,
          lng: Number
        }
      }
    },
    destination: {
      cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
      },
      name: String,
      majorTerminal: {
        name: String,
        location: {
          lat: Number,
          lng: Number
        }
      }
    },
    intermediateStops: [{
      cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
      },
      name: String,
      stopName: String,
      location: {
        lat: Number,
        lng: Number
      },
      sequence: Number,
      stopDuration: Number // minutes
    }]
  },
  startLocation: {
    name: String,
    lat: Number,
    lng: Number
  },
  endLocation: {
    name: String,
    lat: Number,
    lng: Number
  },
  // Detailed route segments
  segments: [{
    from: {
      name: String,
      location: {
        lat: Number,
        lng: Number
      }
    },
    to: {
      name: String,
      location: {
        lat: Number,
        lng: Number
      }
    },
    distance: Number, // km
    estimatedTime: Number, // minutes
    roadType: {
      type: String,
      enum: ['highway', 'city', 'rural'],
      default: 'city'
    }
  }],
  stops: [{
    name: String,
    lat: Number,
    lng: Number,
    sequence: Number,
    busStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusStop'
    }
  }],
  // Schedule information
  schedule: {
    frequency: Number, // minutes between buses
    operatingHours: {
      start: String, // "06:00"
      end: String    // "22:00"
    },
    departures: [{
      time: String, // "06:30"
      busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
      },
      driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
      },
      isActive: Boolean
    }],
    weekendSchedule: {
      isOperational: {
        type: Boolean,
        default: true
      },
      modifiedFrequency: Number,
      modifiedHours: {
        start: String,
        end: String
      }
    }
  },
  // Route statistics and information
  routeInfo: {
    totalDistance: {
      type: Number, // km
      default: 0
    },
    estimatedTravelTime: {
      type: Number, // minutes
      default: 0
    },
    averageSpeed: {
      type: Number, // km/h
      default: 0
    },
    totalStops: {
      type: Number,
      default: 0
    }
  },
  // Pricing information
  fare: {
    baseFare: {
      type: Number,
      default: 0
    },
    farePerKm: {
      type: Number,
      default: 0
    },
    studentDiscount: {
      type: Number,
      default: 0 // percentage
    },
    seniorDiscount: {
      type: Number,
      default: 0 // percentage
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
routeSchema.index({ 'cities.origin.cityId': 1 });
routeSchema.index({ 'cities.destination.cityId': 1 });
routeSchema.index({ routeType: 1 });
routeSchema.index({ startLocation: '2dsphere' });
routeSchema.index({ endLocation: '2dsphere' });

// Method to calculate total route distance
routeSchema.methods.calculateTotalDistance = function() {
  if (this.segments && this.segments.length > 0) {
    return this.segments.reduce((total, segment) => total + (segment.distance || 0), 0);
  }
  return 0;
};

// Method to calculate estimated travel time
routeSchema.methods.calculateTotalTime = function() {
  if (this.segments && this.segments.length > 0) {
    return this.segments.reduce((total, segment) => total + (segment.estimatedTime || 0), 0);
  }
  return 0;
};

// Method to get next departure
routeSchema.methods.getNextDeparture = function() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes from midnight
  
  if (!this.schedule || !this.schedule.departures) {
    return null;
  }
  
  const futureDepartures = this.schedule.departures
    .filter(dep => {
      const [hours, minutes] = dep.time.split(':').map(Number);
      const depTime = hours * 60 + minutes;
      return depTime > currentTime && dep.isActive;
    })
    .sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });
    
  return futureDepartures.length > 0 ? futureDepartures[0] : null;
};

// Static method to find routes between cities
routeSchema.statics.findBetweenCities = function(originCityId, destinationCityId) {
  return this.find({
    'cities.origin.cityId': originCityId,
    'cities.destination.cityId': destinationCityId,
    isActive: true
  }).populate('cities.origin.cityId cities.destination.cityId');
};

// Static method to find routes from a city
routeSchema.statics.findFromCity = function(cityId) {
  return this.find({
    'cities.origin.cityId': cityId,
    isActive: true
  }).populate('cities.origin.cityId cities.destination.cityId');
};

module.exports = mongoose.model('Route', routeSchema);
