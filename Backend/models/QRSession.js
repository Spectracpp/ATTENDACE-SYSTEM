const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
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
  type: {
    type: String,
    enum: ['attendance', 'event', 'access'],
    default: 'attendance'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    radius: Number // meters
  },
  metadata: {
    eventName: String,
    description: String,
    maxAttendees: Number
  },
  settings: {
    allowMultipleScans: {
      type: Boolean,
      default: false
    },
    requireLocation: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalScans: {
      type: Number,
      default: 0
    },
    uniqueScans: {
      type: Number,
      default: 0
    },
    lastScanAt: Date
  },
  // Add QR image field to store generated QR code
  qrImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
qrSessionSchema.index({ sessionId: 1 });
qrSessionSchema.index({ organization: 1 });
qrSessionSchema.index({ status: 1 });
qrSessionSchema.index({ createdAt: 1 });

// Method to check if session is expired
qrSessionSchema.methods.isExpired = function() {
  return this.expiresAt <= new Date();
};

// Method to check if location is valid (if required)
qrSessionSchema.methods.isLocationValid = function(userLat, userLong) {
  if (!this.settings.requireLocation || !this.location.coordinates) {
    return true;
  }

  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.coordinates.latitude * Math.PI/180;
  const φ2 = userLat * Math.PI/180;
  const Δφ = (userLat - this.location.coordinates.latitude) * Math.PI/180;
  const Δλ = (userLong - this.location.coordinates.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= this.location.radius;
};

module.exports = mongoose.model('QRSession', qrSessionSchema);
