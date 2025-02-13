const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Organization = require('../../models/Organization');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test123!@#',
  role: 'admin'
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  firstName: 'Regular',
  lastName: 'User',
  email: 'regular@example.com',
  password: 'Regular123!@#',
  role: 'user'
};

const organizationOneId = new mongoose.Types.ObjectId();
const organizationOne = {
  _id: organizationOneId,
  name: 'Test Organization',
  code: 'TEST001',
  type: 'business',
  admins: [{
    user: userOneId,
    role: 'owner'
  }],
  members: [{
    user: userTwoId,
    role: 'member'
  }],
  settings: {
    qrCodeExpiry: 300,
    allowedRadius: 100,
    requireLocation: true
  }
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Organization.deleteMany();
  
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Organization(organizationOne).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  organizationOneId,
  organizationOne,
  setupDatabase
};
