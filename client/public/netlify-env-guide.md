# Netlify Environment Variables Guide

To ensure your Netlify deployment works correctly, make sure to set the following environment variables in your Netlify site settings:

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following environment variables:

## Required Variables
- `DATABASE_URL`: Your Neon PostgreSQL connection URL
- `SESSION_SECRET`: A secure random string for session encryption

## Firebase Authentication (if needed)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID

## Stripe Payments (if needed)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (starts with pk_)
- `STRIPE_SECRET_KEY`: Stripe secret key (starts with sk_)

## Note
Remember that variables prefixed with `VITE_` will be available to the frontend code.