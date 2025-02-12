const mongoose = require('mongoose');
const Organization = require('../models/Organization');
require('dotenv').config();

async function createDefaultOrg() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a system user ID for the default org
    const systemId = new mongoose.Types.ObjectId();
    
    // Check if default org exists
    const existingOrg = await Organization.findOne({ uid: 'default' });
    if (!existingOrg) {
      const defaultOrg = new Organization({
        name: 'Default Organization',
        uid: 'default',
        admin_ids: [systemId],
        created_by: systemId
      });
      await defaultOrg.save();
      console.log('Default organization created successfully');
    } else {
      console.log('Default organization already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultOrg();
