const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const register = async (userData) => {
  const {
    email,
    password,
    name,
    role,
    registrationCode,
    phone,
    employeeId,
    department,
    studentId,
    course,
    semester
  } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      { employeeId },
      { studentId: studentId || null }
    ]
  });
  
  if (existingUser) {
    throw new Error('User already exists with this email, employee ID, or student ID');
  }

  // Validate admin registration
  if (role === 'admin') {
    if (!registrationCode) {
      throw new Error('Registration code is required for admin registration');
    }
    if (registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
      throw new Error('Invalid admin registration code');
    }
    if (!department) {
      throw new Error('Department is required for admin registration');
    }
  }

  // Validate semester if provided
  if (semester && (semester < 1 || semester > 8)) {
    throw new Error('Semester must be between 1 and 8');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user with all fields
  const user = new User({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    role: role || 'user',
    phone,
    employeeId,
    department,
    studentId,
    course,
    semester,
    isActive: true,
    rewardPoints: 0,
    createdAt: new Date()
  });

  await user.save();
  return user;
};

const login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    token,
    user: userResponse
  };
};

const logout = async (userId) => {
  // In a more complex system, you might want to invalidate the token
  // For now, we'll just return success as the frontend will remove the token
  return true;
};

module.exports = {
  register,
  login,
  logout
};