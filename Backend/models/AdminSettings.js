const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  setting: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'security', 'notifications', 'attendance', 'qr']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster lookups
adminSettingsSchema.index({ setting: 1 });

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

module.exports = AdminSettings;
