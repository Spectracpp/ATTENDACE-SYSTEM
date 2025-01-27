// Token management in localStorage
const TOKEN_KEY = "authToken";
const TOKEN_EXPIRY_KEY = "authTokenExpiry";
const USER_TYPE_KEY = "userType";

const auth = {
  // Set authentication data
  setAuth: (token, expiresIn, userType) => {
    const expiryDate = new Date().getTime() + expiresIn;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toString());
    localStorage.setItem(USER_TYPE_KEY, userType);
  },

  // Get the authentication token
  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
      return null;
    }

    // Check if token has expired
    if (new Date().getTime() > parseInt(expiry)) {
      auth.clearAuth();
      return null;
    }

    return token;
  },

  // Get user type (user/admin)
  getUserType: () => {
    return localStorage.getItem(USER_TYPE_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return auth.getToken() !== null;
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
  },

  // Automatically clear token when it expires
  setupAutoLogout: () => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry) {
      const timeUntilExpiry = parseInt(expiry) - new Date().getTime();
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          auth.clearAuth();
          // You can add a callback here to notify the UI
        }, timeUntilExpiry);
      }
    }
  },
};

module.exports = auth;
