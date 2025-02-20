const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Manage indexes
        try {
            const User = require('../models/User');
            
            // Get existing indexes
            const existingIndexes = await User.collection.indexes();
            console.log('Current indexes:', existingIndexes);
            
            // Drop non-_id indexes
            if (existingIndexes.length > 1) {
                await User.collection.dropIndexes();
                console.log('Dropped existing indexes');
            }
            
            // Create new indexes
            await User.init(); // This ensures indexes are created based on schema
            console.log('Created new indexes successfully');
            
            // Verify new indexes
            const newIndexes = await User.collection.indexes();
            console.log('New indexes:', newIndexes);
            
        } catch (err) {
            console.error('Error managing indexes:', err.message);
            // Don't exit process, just log the error
        }
        
        // Set up event listeners
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
