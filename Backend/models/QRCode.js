const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
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
  data: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['daily', 'event', 'temporary', 'attendance'],
    default: 'daily'
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
    maxScans: {
      type: Number,
      default: 100
    },
    allowMultipleScans: {
      type: Boolean,
      default: false
    },
    locationRadius: {
      type: Number,
      default: 100 // meters
    }
  },
  scans: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    scannedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'disabled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for location-based queries
qrCodeSchema.index({ location: '2dsphere' });

// Method to check if QR code is expired
qrCodeSchema.methods.isExpired = function() {
  return this.validUntil < new Date();
};

// Method to check if QR code has reached max scans
qrCodeSchema.methods.hasReachedMaxScans = function() {
  return this.settings.maxScans > 0 && this.scans.length >= this.settings.maxScans;
};

// Method to check if user has already scanned
qrCodeSchema.methods.hasUserScanned = function(userId) {
  return this.scans.some(scan => scan.user.toString() === userId.toString());
};

// Method to add a scan
qrCodeSchema.methods.addScan = async function(userId, location) {
  this.scans.push({
    user: userId,
    location: location || undefined
  });
  await this.save();
};

// Virtual for scan count
qrCodeSchema.virtual('scanCount').get(function() {
  return this.scans.length;
});

// Ensure virtuals are included in JSON
qrCodeSchema.set('toJSON', { virtuals: true });
qrCodeSchema.set('toObject', { virtuals: true });

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode;
