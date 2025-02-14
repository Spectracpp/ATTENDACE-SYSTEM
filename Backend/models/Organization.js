const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['business', 'education', 'government', 'non-profit'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin'],
      required: true
    }
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member'],
      required: true
    }
  }],
  settings: {
    qrCodeExpiry: {
      type: Number,
      default: 5, // minutes
      min: 1,
      max: 60
    },
    allowMultipleScans: {
      type: Boolean,
      default: false
    },
    requireLocation: {
      type: Boolean,
      default: false
    },
    attendanceWindow: {
      start: {
        type: String,
        default: "09:00" // 24-hour format
      },
      end: {
        type: String,
        default: "17:00"
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  locations: [{
    name: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    radius: {
      type: Number,
      default: 100 // meters
    }
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    maxUsers: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
organizationSchema.index({ status: 1 });
organizationSchema.index({ 'subscription.plan': 1 });
organizationSchema.index({ 'admins.user': 1 });
organizationSchema.index({ 'members.user': 1 });

// Virtual for getting active users count
organizationSchema.virtual('activeUsersCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organizations.organization',
  count: true,
  match: { 'organizations.role': 'member', status: 'active' }
});

module.exports = mongoose.model('Organization', organizationSchema);
