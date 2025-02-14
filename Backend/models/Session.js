const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['regular', 'event', 'meeting'],
    default: 'regular'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active'
  },
  settings: {
    allowLateMarking: {
      type: Boolean,
      default: false
    },
    qrRefreshInterval: {
      type: Number,
      default: 30 // seconds
    },
    locationRadius: {
      type: Number,
      default: 100 // meters
    }
  }
}, {
  timestamps: true
});

// Index for location-based queries
SessionSchema.index({ location: '2dsphere' });

// Methods
SessionSchema.methods.isActive = function() {
  return this.status === 'active';
};

SessionSchema.methods.validateLocation = function(userLat, userLng) {
  if (!this.location || !this.location.coordinates) {
    return false;
  }

  const [longitude, latitude] = this.location.coordinates;
  const radius = this.settings.locationRadius || 100; // meters

  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = latitude * Math.PI/180;
  const φ2 = userLat * Math.PI/180;
  const Δφ = (userLat-latitude) * Math.PI/180;
  const Δλ = (userLng-longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= radius;
};

module.exports = mongoose.model('Session', SessionSchema);
