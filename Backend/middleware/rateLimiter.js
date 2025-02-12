const rateLimit = require('express-rate-limit');

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
    qrGenerationLimiter
};
