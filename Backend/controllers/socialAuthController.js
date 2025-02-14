const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Helper function to get or create user from social profile
const getOrCreateUser = async (profile, provider) => {
  let user = await User.findOne({ 
    $or: [
      { email: profile.email },
      { socialId: profile.id, socialProvider: provider }
    ]
  });

  if (!user) {
    // Create new user
    user = new User({
      email: profile.email,
      firstName: profile.given_name || profile.name.split(' ')[0],
      lastName: profile.family_name || profile.name.split(' ').slice(1).join(' '),
      socialProvider: provider,
      socialId: profile.id,
      avatar: profile.picture,
      socialProfile: new Map(Object.entries(profile)),
      role: 'user',
      isVerified: true // Social login users are considered verified
    });
    await user.save();
  } else if (!user.socialId) {
    // Link social account to existing email user
    user.socialProvider = provider;
    user.socialId = profile.id;
    user.socialProfile = new Map(Object.entries(profile));
    user.avatar = profile.picture;
    user.isVerified = true;
    await user.save();
  }

  return user;
};

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const profile = ticket.getPayload();
    const user = await getOrCreateUser(profile, 'google');
    
    // Generate JWT token
    const jwtToken = generateToken(user);
    
    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

exports.githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user profile
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
    
    const profile = profileResponse.data;
    
    // Get user email (GitHub needs separate request for email)
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
    
    const primaryEmail = emailResponse.data.find(email => email.primary).email;
    profile.email = primaryEmail;
    
    const user = await getOrCreateUser(profile, 'github');
    const jwtToken = generateToken(user);
    
    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(401).json({ message: 'Invalid authentication code' });
  }
};

exports.microsoftAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user profile
    const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
    
    const profile = profileResponse.data;
    const user = await getOrCreateUser(profile, 'microsoft');
    const jwtToken = generateToken(user);
    
    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Microsoft auth error:', error);
    res.status(401).json({ message: 'Invalid authentication code' });
  }
};
