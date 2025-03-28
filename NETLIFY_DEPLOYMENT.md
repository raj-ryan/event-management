# Deploying EventZen to Netlify

This guide will walk you through deploying your EventZen application to Netlify.

## Prerequisites

Before deploying to Netlify, make sure you have:

1. A GitHub, GitLab, or Bitbucket repository with your EventZen code
2. A Neon PostgreSQL database set up (must be accessible from Netlify)
3. Firebase project configured with authentication
4. Stripe account with API keys

## Step 1: Prepare Your Application for Deployment

Ensure your application is ready for production:

1. Make all necessary configuration changes
2. Test locally to ensure everything works
3. Commit and push all changes to your repository

## Step 2: Sign Up for Netlify

1. Go to [Netlify](https://app.netlify.com/) and sign up or log in
2. Click "New site from Git" on your Netlify dashboard

## Step 3: Connect Your Git Repository

1. Choose your Git provider (GitHub, GitLab, or Bitbucket)
2. Authorize Netlify to access your repositories
3. Select the repository containing your EventZen application

## Step 4: Configure Build Settings

Enter the following build settings:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Advanced build settings**: 
  - Select the option to create a _redirects file (if not already included in your project)

## Step 5: Configure Environment Variables

In Netlify's site settings, go to "Environment variables" and add the following:

### Database Connection
- `DATABASE_URL`: Your Neon PostgreSQL connection string

### Session Management
- `SESSION_SECRET`: A long, random string to secure user sessions

### Stripe Integration
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key

### Firebase Admin SDK (server-side)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase private key (including the BEGIN/END PRIVATE KEY lines)
- `FIREBASE_CLIENT_EMAIL`: The service account email from Firebase

### Firebase Web SDK (client-side)
- `VITE_FIREBASE_API_KEY`: Your Firebase web API key
- `VITE_FIREBASE_APP_ID`: Your Firebase app ID
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID

## Step 6: Deploy Your Site

1. Click "Deploy site" at the bottom of the page
2. Wait for the build and deployment process to complete

## Step 7: Configure Domain Settings (Optional)

1. In your site dashboard, go to "Domain settings"
2. Add a custom domain if you have one, or use the default Netlify subdomain

## Step 8: Configure Firebase Authentication

1. Go to your Firebase console (https://console.firebase.google.com/)
2. Select your project
3. Go to Authentication > Settings > Authorized domains
4. Add your Netlify domain (e.g., your-site.netlify.app) to the authorized domains

## Step 9: Configure Neon Database Access

1. Log in to your Neon dashboard
2. Go to your project settings
3. Under "Connection settings", ensure that network access is properly configured:
   - For development: Add your IP address
   - For production: Set to "Allow from anywhere" or add Netlify's IP ranges

## Step 10: Test Your Deployed Application

1. Visit your Netlify deployment URL
2. Test all key functionality:
   - User authentication
   - Event creation and management
   - Attendee registration
   - Payment processing
   - Real-time features

## Troubleshooting

### Build Failures

If your build fails, check:
1. Netlify build logs for specific errors
2. Your build command and publish directory settings
3. Dependencies in your package.json

### Authentication Issues

If authentication doesn't work:
1. Check that Firebase environment variables are correctly set
2. Verify your Netlify domain is added to Firebase authorized domains
3. Check browser console for Firebase-related errors

### Database Connection Issues

If database connections fail:
1. Verify the DATABASE_URL is correctly set in environment variables
2. Ensure your Neon database is allowing connections from Netlify
3. Check server logs for database connection errors

### API Call Failures

If API calls fail:
1. Check that your API routes are correctly configured for production
2. Verify all necessary environment variables are set
3. Look for CORS issues in the browser console

## Continuous Deployment

Netlify automatically deploys your site when you push changes to your repository. To disable this feature:

1. Go to your site's "Deploys" settings
2. Under "Continuous Deployment", change to "Stop builds"

## Rollbacks

If you need to roll back to a previous version:

1. Go to your site's "Deploys" page
2. Find the previous working deploy
3. Click "Publish deploy" on that version

## Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Stripe API Docs](https://stripe.com/docs/api)