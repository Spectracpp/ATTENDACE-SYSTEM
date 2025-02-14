const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Spectra:Test1234@cluster0.8d5i3vd.mongodb.net/Qrcode';

async function cleanDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean all collections
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('sessions').deleteMany({});
    await mongoose.connection.db.collection('attendances').deleteMany({});
    
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanDatabase();
