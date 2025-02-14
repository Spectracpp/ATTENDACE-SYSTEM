const express = require('express');
const router = express.Router();
const socialAuthController = require('../controllers/socialAuthController');

// Social authentication routes
router.post('/google', socialAuthController.googleAuth);
router.post('/github', socialAuthController.githubAuth);
router.post('/microsoft', socialAuthController.microsoftAuth);

module.exports = router;
