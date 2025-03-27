/**
 * Environment configuration for the application
 */

// Determine if we're in production or development
const isProd = import.meta.env.PROD;

// API URL will be different depending on environment
export const API_URL = isProd 
  ? '/.netlify/functions/api' // Production API URL (Netlify Functions)
  : '/api'; // Development API URL

// Export other environment variables as needed
export const getApiUrl = (path: string): string => {
  // If the path already starts with the API URL, return it as is
  if (path.startsWith(API_URL)) {
    return path;
  }
  
  // If path already starts with /api, replace it with the appropriate API URL
  if (path.startsWith('/api')) {
    return path.replace('/api', API_URL);
  }
  
  // Otherwise, concatenate the API URL and path
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};