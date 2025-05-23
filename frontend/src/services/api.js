const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30 // 30 requests per minute
};

// Request tracking
const requestTimestamps = [];

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Helper function to create fetch options with auth header
const createFetchOptions = (options = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  };
};

// Rate limiting helper
const checkRateLimit = () => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  // Remove old timestamps
  while (requestTimestamps.length && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }
  
  // Check if we're over the limit
  if (requestTimestamps.length >= RATE_LIMIT.maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  // Add current timestamp
  requestTimestamps.push(now);
};

// Cache implementation
const cache = new Map();

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Helper function to make API requests with caching and rate limiting
const makeRequest = async (endpoint, options = {}, useCache = true) => {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  
  // Check cache first
  if (useCache) {
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Check rate limit
  checkRateLimit();
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...createFetchOptions(options),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const data = await handleResponse(response);
    
    // Cache successful responses
    if (useCache) {
      setCachedData(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

// Auth API calls
export const auth = {
  login: async (username, password) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);
  },

  register: async (username, password) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);
  },
};

// Protected API calls
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const protectedApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// Sessions API
export const sessions = {
  create: async (sessionData) => {
    return makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }, false); // Don't cache POST requests
  },

  getAll: async () => {
    return makeRequest('/sessions');
  },

  getStats: async () => {
    return makeRequest('/sessions/stats');
  },

  getLeaderboard: async (timeframe = 'weekly') => {
    return makeRequest(`/sessions/leaderboard?timeframe=${timeframe}`);
  },
}; 