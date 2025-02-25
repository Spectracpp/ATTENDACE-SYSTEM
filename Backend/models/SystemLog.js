const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error']
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = SystemLog;
