# EventZen Netlify Deployment Guide

This guide provides step-by-step instructions for deploying EventZen to Netlify, including database setup, environment configuration, and troubleshooting common issues.

## Prerequisites

Before you begin, ensure you have:

1. A [Netlify account](https://app.netlify.com/signup)
2. A [Neon PostgreSQL database](https://neon.tech) account
3. [Git](https://git-scm.com/) installed locally
4. [Node.js](https://nodejs.org/) (version 18+) installed locally
5. Optional: A [Firebase](https://firebase.google.com/) project for authentication
6. Optional: A [Stripe](https://stripe.com/) account for payment processing

## Step 1: Set Up Your Neon PostgreSQL Database

1. Log in to your Neon account and create a new project
2. Create a new database within the project named `eventzen` (or your preferred name)
3. Create a password-protected role and note the connection details
4. In the project settings, ensure that your connection security settings allow connections from Netlify's IP range
5. Copy your database connection string, which should look like:
   ```
   postgres://[username]:[password]@[hostname]/[database]
   ```

## Step 2: Prepare Your Local Project

1. Clone your EventZen repository locally
2. Create a `.env` file at the root of your project with the following variables (fill in your own values):
   ```
   DATABASE_URL=postgres://[username]:[password]@[hostname]/[database]
   NEON_DATABASE_URL=postgres://[username]:[password]@[hostname]/[database]
   SESSION_SECRET=your-very-long-random-secret-key
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   STRIPE_SECRET_KEY=your-stripe-secret-key
   VITE_STRIPE_PUBLIC_KEY=your-stripe-publishable-key
   ```
3. Ensure that your project builds successfully locally:
   ```bash
   npm install
   npm run build
   ```

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify UI

1. Log in to your Netlify dashboard
2. Click "New site from Git"
3. Connect to your Git provider and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the environment variables from Step 2
6. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Log in to your Netlify account:
   ```bash
   netlify login
   ```
3. Initialize the Netlify site:
   ```bash
   netlify init
   ```
4. Follow the prompts to either create a new site or link to an existing one
5. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

## Step 4: Set Up Database Schema

After deploying, set up your database schema using Netlify Functions:

1. Visit your deployed site's URL and append `/.netlify/functions/api/setup-database` to initialize the database schema
2. You can verify the setup by checking your Neon dashboard to confirm tables were created

## Step 5: Configure Redirects for SPA Routing

Ensure that your project has the following redirects configured in either `netlify.toml` or in a `_redirects` file in the publish directory:

```
/* /index.html 200
```

This configuration ensures that all routes are handled by your single-page application rather than returning 404 errors.

## Step 6: Firebase Configuration (Optional)

If you're using Firebase Authentication:

1. Go to your Firebase console
2. Add your Netlify domain to the authorized domains list in Authentication > Settings
3. Make sure all required Firebase environment variables are set in Netlify

## Step 7: Stripe Configuration (Optional)

If you're using Stripe for payments:

1. In your Stripe dashboard, ensure you have webhook endpoints configured for your Netlify domain
2. Add your Netlify domain to the list of allowed domains for your Stripe account
3. Verify that your Stripe keys are correctly set in your Netlify environment variables

## Troubleshooting

### Common Issues and Solutions

#### 404 Errors on Routes
- Check that your redirects are correctly configured
- Verify that your `netlify.toml` file is in the root directory
- Ensure your publish directory is set correctly

#### Database Connection Errors
- Check that your DATABASE_URL is correctly formatted
- Verify that your IP is allowed in Neon's connection settings
- Ensure the database user has the necessary permissions

#### Server Functions Not Working
- Check the Function Logs in your Netlify dashboard
- Verify that all environment variables are set correctly
- Ensure your `netlify.toml` functions configuration is correct

#### Firebase Authentication Issues
- Ensure your Firebase domain configuration includes your Netlify URL
- Verify that all Firebase environment variables are correctly set

## Maintenance and Updates

### Updating Your Deployment

To update your deployed site:

1. Push changes to your connected Git repository, or
2. Run `netlify deploy --prod` if using the CLI

### Monitoring

- Use Netlify Analytics to monitor site traffic and performance
- Check Function Logs regularly to spot and fix errors
- Set up Netlify notifications to be alerted of build failures

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

For further assistance, refer to the environment guide at `/netlify-env-guide.md` in the deployed application.