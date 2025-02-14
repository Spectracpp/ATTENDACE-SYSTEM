const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.socialProvider; // Password only required if not using social login
    },
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  organizations: [{
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'employee'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    department: {
      type: String,
      trim: true
    },
    employeeId: {
      type: String,
      trim: true
    }
  }],
  primaryOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  socialProvider: {
    type: String,
    enum: ['google', 'github', 'microsoft', null],
    default: null
  },
  socialId: {
    type: String,
    unique: true,
    sparse: true
  },
  socialProfile: {
    type: Map,
    of: String,
    default: {}
  },
  avatar: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Hide sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Ensure _id is included
  obj._id = obj._id.toString();
  
  // Remove sensitive fields
  delete obj.password;
  delete obj.tokens;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  
  return obj;
};

module.exports = mongoose.model('User', userSchema);
