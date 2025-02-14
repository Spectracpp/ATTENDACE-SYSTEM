const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

const userOneId = new mongoose.Types.ObjectId();
const adminUserId = new mongoose.Types.ObjectId();
const organizationOneId = new mongoose.Types.ObjectId();

const userOne = {
  _id: userOneId,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test123!@#',
  isEmailVerified: true,
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }],
  organizations: [{
    organization: organizationOneId,
    role: 'member',
    joinedAt: new Date()
  }]
};

const adminUser = {
  _id: adminUserId,
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: 'Admin123!@#',
  isEmailVerified: true,
  role: 'admin',
  tokens: [{
    token: jwt.sign({ _id: adminUserId }, process.env.JWT_SECRET)
  }],
  organizations: [{
    organization: organizationOneId,
    role: 'admin',
    joinedAt: new Date()
  }]
};

const organizationOne = {
  _id: organizationOneId,
  name: 'Test Organization',
  code: 'TEST-ORG',
  type: 'business',
  createdBy: adminUserId,
  admins: [{
    user: adminUserId,
    role: 'owner'
  }],
  members: [{
    user: userOneId,
    role: 'member'
  }],
  settings: {
    qrCodeExpiry: 30,
    allowMultipleScans: false,
    requireLocation: true,
    attendanceWindow: {
      start: '09:00',
      end: '17:00'
    }
  },
  status: 'active',
  locations: [{
    name: 'Main Office',
    address: '123 Test St',
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    radius: 100
  }],
  subscription: {
    plan: 'basic',
    maxUsers: 50
  }
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Organization.deleteMany();
  
  await new User(userOne).save();
  await new User(adminUser).save();
  await new Organization(organizationOne).save();
};

module.exports = {
  userOne,
  userOneId,
  adminUser,
  adminUserId,
  organizationOne,
  organizationOneId,
  setupDatabase
};
