# Netlify Deployment Guide for EventZen

## Current Issues
- 404 errors on direct URL access
- Database foreign key constraints when creating events

## Fixes Applied
1. Updated netlify.toml:
   - Added `force = true` to redirects
   - Changed publish directory from `dist` to `dist/public` to match Vite output

2. Added client/public/_redirects file as a backup for SPA routing:
   ```
   /api/*  /.netlify/functions/api/:splat  200
   /ws     /.netlify/functions/ws          200
   /*      /index.html                     200
   ```

## Required Environment Variables
Make sure these are set in your Netlify dashboard under Site settings > Environment variables:

### Core Variables
- `DATABASE_URL`: Your Neon PostgreSQL connection URL
- `SESSION_SECRET`: A secure random string for session encryption

### Firebase Authentication
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID

### Stripe Payments
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (starts with pk_)
- `STRIPE_SECRET_KEY`: Stripe secret key (starts with sk_)

## Build Settings
- Base Directory: `/` (root)
- Build Command: `npm run build`
- Publish Directory: `dist/public`
- Functions Directory: `netlify/functions`

## Database Error Fix
The error "violates foreign key constraint 'events_venue_id_venues_id_fk'" means:
- When creating an event, the venue ID doesn't exist in the venues table
- Ensure any venues referenced in events exist in the database
- Check the venue ID field in your event creation form

## Testing Locally
Before deploying, test:
1. Direct URL access (e.g., /events/123)
2. API endpoints (/api/venues, /api/events)
3. WebSocket connection (/ws)

## Rebuild & Deploy
After making these changes, trigger a new build in your Netlify dashboard to apply all fixes.