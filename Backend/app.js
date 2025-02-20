const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const authCheckRoutes = require('./routes/auth-check');
const userRoutes = require('./routes/userRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');

require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL || 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/check', authCheckRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/qr', qrCodeRoutes);

// Static files
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationErrors = {};
    for (let field in err.errors) {
      validationErrors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `This ${field} is already registered`,
      field
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;
