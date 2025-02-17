const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['daily', 'event', 'temporary'],
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
      },
      radius: {
        type: Number,
        default: 100 // radius in meters
      }
    },
    settings: {
      maxScans: {
        type: Number,
        default: -1 // -1 means unlimited
      },
      allowMultipleScans: {
        type: Boolean,
        default: false
      }
    },
    scans: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
      status: {
        type: String,
        enum: ['success', 'outside_radius', 'expired', 'invalid'],
        required: true
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes for performance
qrCodeSchema.index({ organization: 1 });
qrCodeSchema.index({ data: 1 }, { unique: true });
qrCodeSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired documents
qrCodeSchema.index({ location: '2dsphere' }); // Geospatial index for location queries

// Methods
qrCodeSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.settings.maxScans === -1 || this.scans.length < this.settings.maxScans)
  );
};

qrCodeSchema.methods.isWithinRadius = function(userLat, userLng) {
  if (!this.location.coordinates[0] || !this.location.coordinates[1]) return true;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.location.coordinates[1] * Math.PI/180;
  const φ2 = userLat * Math.PI/180;
  const Δφ = (userLat - this.location.coordinates[1]) * Math.PI/180;
  const Δλ = (userLng - this.location.coordinates[0]) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= this.location.radius;
};

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
