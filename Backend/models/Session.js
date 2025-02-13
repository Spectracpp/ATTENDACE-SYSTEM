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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    radius: {
      type: Number,
      required: true,
      default: 100 // radius in meters
    }
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  settings: {
    allowLateMarking: {
      type: Boolean,
      default: false
    },
    requireLocation: {
      type: Boolean,
      default: true
    },
    allowedDevices: {
      type: [String],
      default: ['mobile', 'tablet', 'desktop']
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  qrCode: {
    secret: {
      type: String,
      required: true
    },
    refreshInterval: {
      type: Number,
      default: 30 // seconds
    }
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
SessionSchema.index({ organization: 1, startTime: -1 });
SessionSchema.index({ location: '2dsphere' });
SessionSchema.index({ status: 1 });

// Methods
SessionSchema.methods.isActive = function() {
  const now = new Date();
  return this.startTime <= now && now <= this.endTime && this.status === 'active';
};

SessionSchema.methods.isExpired = function() {
  return new Date() > this.endTime;
};

SessionSchema.methods.validateLocation = function(userLat, userLng) {
  if (!this.settings.requireLocation) return true;
  
  const [sessionLng, sessionLat] = this.location.coordinates;
  
  // Calculate distance using the Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = sessionLat * Math.PI/180;
  const φ2 = userLat * Math.PI/180;
  const Δφ = (userLat - sessionLat) * Math.PI/180;
  const Δλ = (userLng - sessionLng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= this.location.radius;
};

SessionSchema.methods.generateQRData = function() {
  const payload = {
    sessionId: this._id,
    organizationId: this.organization,
    timestamp: new Date().getTime(),
    secret: this.qrCode.secret
  };
  
  return JSON.stringify(payload);
};

module.exports = mongoose.model('Session', SessionSchema);
