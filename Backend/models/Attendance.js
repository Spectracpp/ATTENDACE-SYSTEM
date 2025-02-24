const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['in', 'out'],
    required: true
  },
  date: {
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
  device: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for location-based queries
attendanceSchema.index({ location: '2dsphere' });

// Index for faster queries by date
attendanceSchema.index({ date: -1 });

// Index for faster user queries
attendanceSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
