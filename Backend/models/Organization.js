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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [{
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
    default: [] // Initialize with empty array
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
organizationSchema.virtual('memberCount').get(function() {
  return Array.isArray(this.members) ? this.members.length : 0;
});

// Method to check if a user has a specific role in the organization
organizationSchema.methods.hasRole = function(userId, role) {
  if (!Array.isArray(this.members)) return false;
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
  if (!Array.isArray(this.members)) {
    this.members = [];
  }
  if (!this.members.some(m => m.user.toString() === userId.toString())) {
    this.members.push({ user: userId, role });
    await this.save();
  }
};

// Method to remove a member
organizationSchema.methods.removeMember = async function(userId) {
  if (!Array.isArray(this.members)) {
    this.members = [];
    return;
  }
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  await this.save();
};

// Method to update member role
organizationSchema.methods.updateMemberRole = async function(userId, newRole) {
  if (!Array.isArray(this.members)) {
    this.members = [];
    return;
  }
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.role = newRole;
    await this.save();
  }
};

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
