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
      message: 'Validation failed',
      errors: groupedErrors,
      errorSummary: errorMessages.join('; ')
    });
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage('Password must contain at least one letter and one number'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    handleValidation
  ],
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidation
  ],
  update: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    handleValidation
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage('New password must contain at least one letter and one number'),
    handleValidation
  ],
  forgotPassword: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    handleValidation
  ],
  resetPassword: [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
      .withMessage('Password must contain at least one letter and one number'),
    handleValidation
  ]
};

// Organization validation rules
const organizationValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Organization name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Organization name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('type')
      .trim()
      .notEmpty()
      .withMessage('Organization type is required')
      .isIn(['business', 'education', 'nonprofit', 'other'])
      .withMessage('Invalid organization type'),
    handleValidation
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Organization name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('type')
      .optional()
      .trim()
      .isIn(['business', 'education', 'nonprofit', 'other'])
      .withMessage('Invalid organization type'),
    handleValidation
  ],
  addMember: [
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    body('role')
      .optional()
      .trim()
      .isIn(['admin', 'member'])
      .withMessage('Invalid role. Must be either admin or member'),
    handleValidation
  ],
  updateMember: [
    body('role')
      .optional()
      .trim()
      .isIn(['admin', 'member'])
      .withMessage('Invalid role. Must be either admin or member'),
    handleValidation
  ],
  switch: [
    body('organizationId')
      .isMongoId()
      .withMessage('Invalid organization ID'),
    handleValidation
  ]
};

// QR Code validation rules
const qrCodeValidation = {
  generate: [
    body('type')
      .trim()
      .notEmpty()
      .withMessage('QR code type is required')
      .isIn(['attendance', 'event'])
      .withMessage('Invalid QR code type'),
    body('organizationId')
      .trim()
      .notEmpty()
      .withMessage('Organization ID is required')
      .isMongoId()
      .withMessage('Invalid organization ID format'),
    body('validityHours')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Validity hours must be between 1 and 24'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object')
      .custom((value) => {
        if (value && (!value.latitude || !value.longitude)) {
          throw new Error('Location must include latitude and longitude');
        }
        if (value) {
          const { latitude, longitude } = value;
          if (latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
          if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
        }
        return true;
      }),
    handleValidation
  ],
  scan: [
    body('qrData')
      .trim()
      .notEmpty()
      .withMessage('QR code data is required'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object')
      .custom((value) => {
        if (value && (!value.latitude || !value.longitude)) {
          throw new Error('Location must include latitude and longitude');
        }
        if (value) {
          const { latitude, longitude } = value;
          if (latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
          if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
        }
        return true;
      }),
    handleValidation
  ],
  validate: [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('QR code is required'),
    handleValidation
  ]
};

// Attendance validation rules
const attendanceValidation = {
  fetch: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (value && req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    handleValidation
  ],
  mark: [
    body('type')
      .trim()
      .notEmpty()
      .withMessage('Attendance type is required')
      .isIn(['check-in', 'check-out'])
      .withMessage('Invalid attendance type'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object')
      .custom((value) => {
        if (value && (!value.latitude || !value.longitude)) {
          throw new Error('Location must include latitude and longitude');
        }
        return true;
      }),
    param('organizationId')
      .trim()
      .notEmpty()
      .withMessage('Organization ID is required')
      .isMongoId()
      .withMessage('Invalid organization ID format'),
    handleValidation
  ]
};

module.exports = {
  userValidation,
  organizationValidation,
  qrCodeValidation,
  attendanceValidation,
  handleValidation
};
