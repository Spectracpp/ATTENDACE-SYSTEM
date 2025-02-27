import { API_URL } from '@/lib/config';

const getStoredAuth = () => {
  if (typeof window === 'undefined') return null;
  try {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Error parsing auth from localStorage:', error);
    return null;
  }
};

export async function apiRequest(endpoint, options = {}) {
  try {
    const isFormData = options.isFormData || false;
    const auth = getStoredAuth();
    const token = auth?.token;

    // Also check for token in localStorage from our AuthContext
    let userToken = null;
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        userToken = user?.token;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    const headers = {
      'Accept': 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    };

    // Add authorization header if token exists (try both auth sources)
    if (token || userToken) {
      headers['Authorization'] = `Bearer ${token || userToken}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      credentials: 'include',
      mode: 'cors',
      // Add timeout to prevent hanging requests
      signal: options.signal || (options.timeout ? AbortSignal.timeout(options.timeout) : undefined),
      ...options
    };

    // Handle request body
    if (options.body) {
      config.body = isFormData ? options.body : JSON.stringify(options.body);
    }

    // Remove custom options
    delete config.isFormData;
    delete config.timeout;
    delete config.retries;

    console.log(`Making ${config.method} request to ${endpoint}`, {
      headers: config.headers,
      body: options.body ? '(body present)' : '(no body)'
    });

    // Add retry logic for network errors
    let retries = options.retries || 2;
    let lastError;

    while (retries >= 0) {
      try {
        const fullUrl = `${API_URL}${endpoint}`;
        console.log(`Fetching from: ${fullUrl}`);
        
        const response = await fetch(fullUrl, config);
        
        // Handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            data = { 
              success: false, 
              message: 'Failed to parse JSON response',
              error: jsonError.message
            };
          }
        } else {
          const text = await response.text();
          console.warn(`Non-JSON response received from ${endpoint}:`, text.substring(0, 150));
          
          // For development, create a more helpful fallback response
          data = { 
            success: false,
            message: 'Non-JSON response received',
            endpoint,
            status: response.status,
            contentType: contentType || 'none',
            textPreview: text.substring(0, 150) // Include a snippet of the response
          };
        }

        if (!response.ok) {
          const errorMessage = data.message || `HTTP error! status: ${response.status}`;
          console.error(`API error (${response.status}):`, errorMessage);
          
          // For 404 errors, return a standardized response instead of throwing
          if (response.status === 404) {
            return {
              success: false,
              message: `API endpoint not found: ${endpoint}`,
              error: `404 Not Found: ${endpoint}`,
              // Include fallback empty data to prevent UI errors
              organizations: [],
              users: [],
              attendance: []
            };
          }
          
          throw new Error(errorMessage);
        }

        // If the response doesn't have a success field, add it
        if (data.success === undefined) {
          data.success = true;
        }

        return data;
      } catch (error) {
        lastError = error;
        
        // Only retry on network errors, not HTTP errors
        if (error.name === 'TypeError' || error.name === 'AbortError') {
          retries--;
          if (retries >= 0) {
            console.log(`Retrying API request to ${endpoint}, ${retries} retries left`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
        } else {
          // Don't retry HTTP errors
          break;
        }
      }
    }
    
    // If we got here, all retries failed
    console.error(`All retries failed for ${endpoint}:`, lastError);
    throw lastError;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    
    // Return a standardized error object instead of throwing
    return {
      success: false,
      message: error.message || 'An error occurred while making the request',
      error: error.toString()
    };
  }
}
