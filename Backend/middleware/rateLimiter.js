const rateLimit = require('express-rate-limit');

// General rate limiter for most routes
const rateLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes window by default
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: process.env.AUTH_RATE_LIMIT_WINDOW || 60 * 60 * 1000, // 1 hour window by default
    max: process.env.AUTH_RATE_LIMIT_MAX || 5, // limit each IP to 5 requests per window
    message: 'Too many authentication attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // don't count successful requests
});

// QR code generation rate limiter
const qrGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // limit each user to 10 QR generations per hour
    message: 'Too many QR code generations. Please try again in an hour.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID as the key for rate limiting
        return req.user ? req.user._id.toString() : req.ip;
    },
    skip: (req) => {
        // Skip rate limiting if user is refreshing an existing QR code
        return req.body && req.body.refresh && req.body.qrId;
    }
});

module.exports = {
    rateLimiter,
    authLimiter,
    qrGenerationLimiter
};
