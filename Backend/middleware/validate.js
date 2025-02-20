const { body, param, query, validationResult } = require('express-validator');

// Enhanced validation error handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Group errors by field
    const groupedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.path]) {
        acc[error.path] = [];
      }
      acc[error.path].push(error.msg);
      return acc;
    }, {});

    // Create a readable message listing all missing/invalid fields
    const errorMessages = Object.entries(groupedErrors).map(([field, messages]) => {
      return `${field}: ${messages.join(', ')}`;
    });

    return res.status(400).json({ 
      success: false,
      message: "Validation failed",
      errors: groupedErrors,
      errorMessages,
      invalidFields: Object.keys(groupedErrors)
    });
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .trim(),
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .trim(),
    handleValidation
  ],
  login: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidation
  ],
  update: [
    body('firstName')
      .optional()
      .notEmpty().withMessage('First name cannot be empty')
      .trim(),
    body('lastName')
      .optional()
      .notEmpty().withMessage('Last name cannot be empty')
      .trim(),
    handleValidation
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    handleValidation
  ],
  forgotPassword: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    handleValidation
  ],
  resetPassword: [
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    handleValidation
  ]
};

// Organization validation rules
const organizationValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('Organization name is required')
      .trim().isLength({ min: 2, max: 100 }),
    body('code')
      .notEmpty().withMessage('Organization code is required')
      .trim().isLength({ min: 2, max: 20 })
      .matches(/^[A-Z0-9-]+$/).withMessage('Invalid organization code format'),
    body('type')
      .optional()
      .isIn(['business', 'education', 'government', 'other']).withMessage('Invalid organization type'),
    handleValidation
  ],
  update: [
    body('name')
      .optional()
      .notEmpty().withMessage('Organization name cannot be empty')
      .trim().isLength({ min: 2, max: 100 }),
    body('code')
      .optional()
      .notEmpty().withMessage('Organization code cannot be empty')
      .trim().isLength({ min: 2, max: 20 })
      .matches(/^[A-Z0-9-]+$/).withMessage('Invalid organization code format'),
    body('type')
      .optional()
      .isIn(['business', 'education', 'government', 'other']).withMessage('Invalid organization type'),
    handleValidation
  ],
  addMember: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('role')
      .isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
    handleValidation
  ],
  updateMember: [
    body('role')
      .isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
    handleValidation
  ],
  switch: [
    body('organizationId')
      .isMongoId().withMessage('Invalid organization ID'),
    handleValidation
  ]
};

// QR Code validation rules
const qrCodeValidation = {
  generate: [
    body('type')
      .isIn(['daily', 'meeting', 'event']).withMessage('Invalid QR code type'),
    body('validityHours')
      .optional()
      .isInt({ min: 1, max: 72 }).withMessage('Invalid validity hours'),
    body('location')
      .optional()
      .isObject().withMessage('Location must be an object'),
    body('location.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('settings')
      .optional()
      .isObject().withMessage('Settings must be an object'),
    body('settings.maxDistance')
      .optional()
      .isInt({ min: 10, max: 1000 }).withMessage('Invalid max distance'),
    handleValidation
  ],
  scan: [
    body('qrData')
      .notEmpty().withMessage('QR data is required'),
    body('location')
      .optional()
      .isObject().withMessage('Location must be an object'),
    body('location.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    handleValidation
  ]
};

// Attendance validation rules
const attendanceValidation = {
  fetch: [
    query('startDate')
      .optional()
      .isISO8601().withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Invalid end date format'),
    query('userId')
      .optional()
      .isMongoId().withMessage('Invalid user ID'),
    handleValidation
  ],
  mark: [
    body('status')
      .optional()
      .isIn(['present', 'late', 'absent', 'excused']).withMessage('Invalid attendance status'),
    body('location')
      .optional()
      .isObject().withMessage('Location must be an object'),
    body('location.latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    handleValidation
  ]
};

module.exports = {
  userValidation,
  organizationValidation,
  qrCodeValidation,
  attendanceValidation
};
