const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: errors.array() 
    });
  }
  next();
};

// User validation rules
const userValidation = {
  create: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    handleValidation
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidation
  ],
  update: [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    handleValidation
  ],
  changePassword: [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    handleValidation
  ],
  forgotPassword: [
    body('email').isEmail().normalizeEmail(),
    handleValidation
  ],
  resetPassword: [
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    handleValidation
  ]
};

// Organization validation rules
const organizationValidation = {
  create: [
    body('name').trim().notEmpty(),
    body('code').trim().notEmpty()
      .matches(/^[A-Z0-9-]{3,10}$/),
    body('type').isIn(['business', 'education', 'government', 'non-profit']),
    handleValidation
  ],
  update: [
    param('id').isMongoId(),
    body('name').optional().trim().notEmpty(),
    body('settings').optional().isObject(),
    body('settings.qrCodeExpiry').optional().isInt({ min: 1, max: 60 }),
    handleValidation
  ],
  addMember: [
    param('id').isMongoId(),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['member', 'admin']),
    handleValidation
  ]
};

// Session validation rules
const sessionValidation = {
  create: [
    body('name').trim().notEmpty(),
    body('type').isIn(['regular', 'event', 'meeting']),
    body('organization').isMongoId(),
    body('location').isObject(),
    body('location.latitude').isFloat({ min: -90, max: 90 }),
    body('location.longitude').isFloat({ min: -180, max: 180 }),
    body('location.radius').optional().isInt({ min: 10, max: 1000 }),
    body('startTime').isISO8601(),
    body('endTime').isISO8601().custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
    body('settings').optional().isObject(),
    body('settings.allowLateMarking').optional().isBoolean(),
    body('settings.requireLocation').optional().isBoolean(),
    body('settings.allowedDevices').optional().isArray(),
    body('settings.allowedDevices.*').optional().isIn(['mobile', 'tablet', 'desktop']),
    body('settings.qrRefreshInterval').optional().isInt({ min: 10, max: 300 }),
    handleValidation
  ],
  markAttendance: [
    param('id').isMongoId(),
    body('location').optional().isObject(),
    body('location.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('location.longitude').optional().isFloat({ min: -180, max: 180 }),
    body('device').isObject(),
    body('device.type').isIn(['mobile', 'tablet', 'desktop']),
    body('device.userAgent').notEmpty(),
    body('device.deviceId').optional().notEmpty(),
    handleValidation
  ]
};

// QR Session validation rules
const qrSessionValidation = {
  create: [
    body('organization').isMongoId(),
    body('type').optional().isIn(['attendance', 'event', 'access']),
    body('location').optional().isObject(),
    body('location.coordinates').optional().isObject(),
    body('location.coordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('location.coordinates.longitude').optional().isFloat({ min: -180, max: 180 }),
    handleValidation
  ],
  scan: [
    body('sessionId').notEmpty(),
    body('location').optional().isObject(),
    body('location.coordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('location.coordinates.longitude').optional().isFloat({ min: -180, max: 180 }),
    handleValidation
  ]
};

// Attendance validation rules
const attendanceValidation = {
  mark: [
    body('qrSession').isMongoId(),
    body('location').optional().isObject(),
    body('location.coordinates.latitude').optional().isFloat({ min: -90, max: 90 }),
    body('location.coordinates.longitude').optional().isFloat({ min: -180, max: 180 }),
    handleValidation
  ],
  query: [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('status').optional().isIn(['present', 'late', 'excused', 'absent']),
    handleValidation
  ]
};

module.exports = {
  userValidation,
  organizationValidation,
  sessionValidation,
  qrSessionValidation,
  attendanceValidation
};
