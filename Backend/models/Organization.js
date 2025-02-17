const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['business', 'education', 'government', 'non-profit', 'other']
  },
  description: {
    type: String,
    trim: true
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
  address: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  settings: {
    maxQrScans: {
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for location-based queries
organizationSchema.index({ location: '2dsphere' });

// Method to check if a user has a specific role in the organization
organizationSchema.methods.hasRole = function(userId, role) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;

  const roleHierarchy = {
    'member': 0,
    'admin': 1,
    'owner': 2
  };

  return roleHierarchy[member.role] >= roleHierarchy[role];
};

// Method to add a member
organizationSchema.methods.addMember = async function(userId, role = 'member') {
  if (!this.members.some(m => m.user.toString() === userId.toString())) {
    this.members.push({ user: userId, role });
    await this.save();
  }
};

// Method to remove a member
organizationSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  await this.save();
};

// Method to update member role
organizationSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
    await this.save();
  }
};

// Virtual for member count
organizationSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Ensure virtuals are included in JSON
organizationSchema.set('toJSON', { virtuals: true });
organizationSchema.set('toObject', { virtuals: true });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
