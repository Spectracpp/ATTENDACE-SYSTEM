const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create a system admin user ID
const SYSTEM_ADMIN_ID = new mongoose.Types.ObjectId();

const defaultOrganizations = [
  {
    name: 'Manav Rachna International University',
    code: 'MRIU',
    type: 'education',
    description: 'A leading private university in Faridabad, Haryana',
    address: 'Sector 43, Faridabad, Haryana 121004',
    contactEmail: 'info@mriu.edu.in',
    contactPhone: '0129-4198000',
    createdBy: SYSTEM_ADMIN_ID
  },
  {
    name: 'Delhi Public School',
    code: 'DPS',
    type: 'education',
    description: 'One of the largest chains of private schools in India',
    address: 'Mathura Road, New Delhi 110003',
    contactEmail: 'info@dps.edu.in',
    contactPhone: '011-4052000',
    createdBy: SYSTEM_ADMIN_ID
  },
  {
    name: 'Indian Institute of Technology Delhi',
    code: 'IITD',
    type: 'education',
    description: 'Premier engineering and research institution',
    address: 'Hauz Khas, New Delhi 110016',
    contactEmail: 'info@iitd.ac.in',
    contactPhone: '011-2659000',
    createdBy: SYSTEM_ADMIN_ID
  },
  {
    name: 'All India Institute of Medical Sciences',
    code: 'AIIMS',
    type: 'education',
    description: 'Premier medical education and research institution',
    address: 'Ansari Nagar, New Delhi 110029',
    contactEmail: 'info@aiims.edu.in',
    contactPhone: '011-2658000',
    createdBy: SYSTEM_ADMIN_ID
  },
  {
    name: 'Jamia Millia Islamia',
    code: 'JMI',
    type: 'education',
    description: 'Central university in New Delhi',
    address: 'Jamia Nagar, New Delhi 110025',
    contactEmail: 'info@jmi.ac.in',
    contactPhone: '011-2698000',
    createdBy: SYSTEM_ADMIN_ID
  }
];

async function seedOrganizations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing organizations
    await Organization.deleteMany({});
    console.log('Cleared existing organizations');

    // Insert default organizations
    const organizations = await Organization.insertMany(defaultOrganizations);
    console.log('Successfully seeded organizations:', organizations.map(org => org.name));

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding organizations:', error);
    process.exit(1);
  }
}

seedOrganizations();
