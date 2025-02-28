const mongoose = require('mongoose');

/**
 * Schema for scan history tracking
 */
const scanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  deviceInfo: {
    type: String
  },
  ip: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  failureReason: {
    type: String
  },
  distance: {
    type: Number
  }
}, { _id: true, timestamps: false });

/**
 * QR Code Schema
 */
const qrCodeSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    type: String,
    required: true
  },
  qrImage: {
    type: String
  },
  type: {
    type: String,
    enum: ['attendance', 'event', 'access', 'other'],
    default: 'attendance'
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  allowMultipleScans: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  settings: {
    locationRadius: {
      type: Number,
      default: 100
    },
    maxScans: {
      type: Number,
      default: 1
    }
  },
  scanHistory: [scanHistorySchema]
}, { timestamps: true });

// Add index for location-based queries
qrCodeSchema.index({ location: '2dsphere' });

// Add compound index for efficiently finding valid QR codes
qrCodeSchema.index({
  organization: 1,
  validUntil: 1,
  isActive: 1
});

/**
 * Check if the QR code is expired
 */
qrCodeSchema.methods.isExpired = function() {
  return new Date() > this.validUntil;
};

/**
 * Get the number of successful scans
 */
qrCodeSchema.methods.getSuccessfulScanCount = function() {
  return this.scanHistory.filter(scan => scan.status === 'success').length;
};

/**
 * Check if the QR code can be scanned again
 */
qrCodeSchema.methods.canBeScanAgain = function() {
  if (this.isExpired()) return false;
  if (this.allowMultipleScans) return true;
  
  const successScans = this.getSuccessfulScanCount();
  return successScans < this.settings.maxScans;
};

/**
 * Add scan record to history
 */
qrCodeSchema.methods.addScanRecord = function(userData) {
  this.scanHistory.push({
    user: userData.userId,
    timestamp: new Date(),
    location: userData.location,
    deviceInfo: userData.deviceInfo,
    ip: userData.ip,
    status: userData.status || 'success',
    failureReason: userData.failureReason,
    distance: userData.distance
  });
};

// Create and export the model
const QRCode = mongoose.model('QRCode', qrCodeSchema);
module.exports = QRCode;
