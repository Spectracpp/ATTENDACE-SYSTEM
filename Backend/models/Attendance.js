const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  qrSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession'
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
    type: {
      deviceType: String,
      browser: String,
      os: String,
      ip: String
    }
  },
  verificationMethod: {
    type: String,
    enum: ['qr', 'manual', 'geolocation'],
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  remarks: String,
  meta: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ organization: 1, date: 1 });
attendanceSchema.index({ location: '2dsphere' });

// Method to check if user has already marked attendance for today
attendanceSchema.statics.hasMarkedToday = async function(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const attendance = await this.findOne({
    user: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  return !!attendance;
};

// Method to get attendance statistics for a user
attendanceSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
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

// Virtual for attendance duration
attendanceSchema.virtual('duration').get(function() {
  if (!this.checkOutTime) return null;
  return (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60); // Duration in hours
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
