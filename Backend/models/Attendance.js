const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
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
      required: true
    }
  },
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      required: true
    },
    userAgent: String,
    ip: String,
    deviceId: String
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'manual', 'geo', 'beacon'],
    default: 'qr'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
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
AttendanceSchema.index({ user: 1, session: 1 }, { unique: true });
AttendanceSchema.index({ organization: 1, createdAt: -1 });
AttendanceSchema.index({ location: '2dsphere' });
AttendanceSchema.index({ status: 1 });

// Methods
AttendanceSchema.methods.isLate = function(sessionStartTime) {
  return this.createdAt > sessionStartTime;
};

AttendanceSchema.methods.updateStatus = function(sessionStartTime, gracePeriod = 15) {
  const markTime = this.createdAt;
  const lateThreshold = new Date(sessionStartTime.getTime() + gracePeriod * 60000);
  
  if (markTime <= sessionStartTime) {
    this.status = 'present';
  } else if (markTime <= lateThreshold) {
    this.status = 'present';
  } else {
    this.status = 'late';
  }
};

// Statics
AttendanceSchema.statics.getStatistics = async function(organizationId, sessionId) {
  const stats = await this.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(organizationId),
        ...(sessionId && { session: new mongoose.Types.ObjectId(sessionId) })
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
