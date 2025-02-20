const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  qrCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'excused'],
    default: 'present'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      required: false
    },
    userAgent: String,
    ip: String,
    deviceId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
AttendanceSchema.index({ user: 1, qrCode: 1 }, { unique: true });
AttendanceSchema.index({ organization: 1, createdAt: -1 });
AttendanceSchema.index({ location: '2dsphere' });

// Methods
AttendanceSchema.methods.isLate = function() {
  if (!this.qrCode) return false;
  return this.createdAt > this.qrCode.validFrom;
};

// Statics
AttendanceSchema.statics.getStatistics = async function(organizationId, startDate, endDate) {
  const match = {
    organization: mongoose.Types.ObjectId(organizationId)
  };

  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        users: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        uniqueUsers: { $size: '$users' },
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
