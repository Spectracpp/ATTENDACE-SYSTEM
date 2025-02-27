const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Configure Mongoose
        mongoose.set('debug', process.env.NODE_ENV === 'development');
        
        // Connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            heartbeatFrequencyMS: 10000,
        };

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set up connection error handlers
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });
        
        // Manage indexes
        try {
            const models = [
                require('../models/User'),
                require('../models/Admin'),
                require('../models/Organization'),
                require('../models/QRCode'),
                require('../models/Attendance'),
                require('../models/SystemLog')
            ];

            // Create indexes for each model
            for (const Model of models) {
                const modelName = Model.modelName;
                console.log(`Creating indexes for ${modelName}...`);
                
                try {
                    await Model.syncIndexes();
                    console.log(`Indexes synchronized for ${modelName}`);
                } catch (indexErr) {
                    console.error(`Error creating indexes for ${modelName}:`, indexErr);
                }
            }
        } catch (indexError) {
            console.error('Error managing indexes:', indexError);
            // Don't throw here, just log the error
        }

        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        
        // Specific error handling
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB server. Please check if MongoDB is running.');
        } else if (error.name === 'MongoParseError') {
            console.error('Invalid MongoDB connection string.');
        }
        
        // Rethrow the error for the calling code to handle
        throw error;
    }
};

module.exports = connectDB;
