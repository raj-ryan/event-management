# EventZen Netlify Environment Setup Guide

This guide will help you configure the necessary environment variables for EventZen when deploying to Netlify.

## Required Environment Variables

Add the following environment variables in your Netlify site dashboard under **Site settings > Build & deploy > Environment variables**:

### Core Database Variables
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEON_DATABASE_URL`: Same as DATABASE_URL, for compatibility with some database tools

### Session Management
- `SESSION_SECRET`: A long random string used to encrypt session data

### Firebase Authentication
- `VITE_FIREBASE_API_KEY`: Your Firebase project API key
- `VITE_FIREBASE_APP_ID`: Your Firebase app ID
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID

### Stripe Payments
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with sk_)
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key (starts with pk_)

## Environment Configuration Tips

1. **Connection Strings**: If your Neon PostgreSQL connection string contains special characters, make sure to properly URL-encode them.

2. **Netlify Functions**: Netlify automatically makes environment variables available to your serverless functions.

3. **Client-Side Variables**: Remember that only variables prefixed with `VITE_` will be accessible in the client-side code.

4. **Verification**: After deploying, use the `/netlify-verify.js` script to check if the deployment is correctly configured.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check that your database connection string is correctly formatted
   - Verify that your IP is allowed in Neon's connection settings
   - Ensure the database user has the necessary permissions

2. **API Errors**:
   - For 404 errors on API routes, check if Netlify redirects are properly configured
   - For 500 errors, check server logs for detailed error messages

3. **Authentication Problems**:
   - Ensure Firebase domain configuration includes your Netlify URL
   - Verify that all Firebase environment variables are correctly set

## Getting Help

If you encounter issues during deployment, please:

1. Check the Netlify deployment logs
2. Verify all environment variables are set correctly
3. Contact support with specific error messages for faster resolution