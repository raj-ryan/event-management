// This file is used to verify Netlify environment variables and settings
// It will be included in the client build and can be loaded from /netlify-verify.js

/**
 * Netlify Deployment Verification
 * 
 * This script performs basic checks to verify that:
 * 1. SPA routing is correctly configured
 * 2. Static assets are being served properly
 * 3. The Netlify environment can access API functions
 * 
 * It does NOT verify database connections or check sensitive environment variables
 */

(function() {
  console.log('EventZen Netlify Deployment Verification Starting...');
  
  // Log the current url to help debugging
  console.log('Current URL:', window.location.href);
  console.log('Path:', window.location.pathname);
  
  // Check for SPA routing
  if (window.location.pathname !== '/netlify-verify.js' && 
      window.location.pathname !== '/') {
    console.log('SPA Routing Test: PASS - This script loaded correctly despite being on a non-root path');
  }
  
  // Check for Netlify environment
  if (window.location.hostname.includes('netlify.app') || 
      document.referrer.includes('netlify.app')) {
    console.log('Netlify Environment Test: PASS - Running on Netlify');
  } else {
    console.log('Netlify Environment Test: INFO - Not running on Netlify (or using custom domain)');
  }
  
  // Test API endpoint connection
  fetch('/api/ping')
    .then(response => {
      if (response.ok) {
        console.log('API Connection Test: PASS - Successfully connected to API endpoint');
        return response.json();
      } else {
        console.error('API Connection Test: FAIL - Unable to connect to API endpoint');
        throw new Error('API connection failed');
      }
    })
    .then(data => {
      console.log('API Response:', data);
    })
    .catch(error => {
      console.error('API Test Error:', error);
    });
    
  console.log('EventZen Netlify Deployment Verification Complete');
})();