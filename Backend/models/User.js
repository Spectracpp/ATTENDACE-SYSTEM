const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Password validation function
const validatePassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  if (!/(?=.*[a-z])/.test(password)) return false;
  if (!/(?=.*[A-Z])/.test(password)) return false;
  if (!/(?=.*\d)/.test(password)) return false;
  if (!/(?=.*[@$!%*?&])/.test(password)) return false;
  return true;
};

const rewardSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  claimed: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: validatePassword,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'Role is required']
  },
  studentId: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return this.role !== 'user' || (v && v.length > 0);
      },
      message: 'Student ID is required for users'
    }
  },
  course: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return this.role !== 'user' || (v && v.length > 0);
      },
      message: 'Course is required for users'
    }
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8'],
    validate: {
      validator: function(v) {
        return this.role !== 'user' || (v && v >= 1 && v <= 8);
      },
      message: 'Valid semester is required for users'
    }
  },
  department: {
    type: String,
    trim: true,
    required: [true, 'Department is required']
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [2, 'Organization name must be at least 2 characters long']
  },
  avatar: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  passwordHistory: [{
    password: String,
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deviceTokens: [{
    token: String,
    device: String,
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  rewards: [rewardSchema],
  activeOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.passwordHistory;
      delete ret.deviceTokens;
      return ret;
    }
  }
});

// Add compound unique index for studentId and organizationName
userSchema.index(
  { studentId: 1, organizationName: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      role: "user",
      studentId: { $exists: true },
      organizationName: { $exists: true }
    },
    background: true
  }
);

// Add single field indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  try {
    const user = this;
    console.log('Pre-save middleware - Password check:', {
      isNew: user.isNew,
      isModified: user.isModified('password'),
      passwordLength: user.password?.length,
      hasPassword: !!user.password
    });

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      console.log('Pre-save middleware - Password not modified, skipping hash');
      return next();
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password
    const hash = await bcrypt.hash(user.password, salt);
    
    // Store hash in password field
    user.password = hash;
    
    // Add to password history
    if (user.isModified('password')) {
      user.passwordHistory.push({
        password: hash,
        changedAt: new Date()
      });
      
      // Keep only last 5 passwords
      if (user.passwordHistory.length > 5) {
        user.passwordHistory = user.passwordHistory.slice(-5);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to check if password was used before
userSchema.methods.isPasswordReused = async function(newPassword) {
  try {
    for (let entry of this.passwordHistory) {
      if (await bcrypt.compare(newPassword, entry.password)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    throw error;
  }
};

// Method to handle failed login attempts
userSchema.methods.handleFailedLogin = function() {
  // Increment login attempts
  this.loginAttempts += 1;
  
  // Lock account if more than 5 failed attempts
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
  }
  
  return this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
