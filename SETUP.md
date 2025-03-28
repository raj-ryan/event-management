# EventZen Setup Guide

This guide will help you set up and run the EventZen application. Follow these steps to get your development environment ready.

## Prerequisites

- Node.js (v16 or higher)
- A Neon PostgreSQL database
- Firebase project (for authentication)
- Stripe account (for payments)

## Step 1: Clone the Repository

If you haven't already, clone the repository:

```bash
git clone <repository-url>
cd event-management
```

## Step 2: Create a Neon PostgreSQL Database

1. Sign up for a free account at [Neon](https://console.neon.tech/signup)
2. Create a new project
3. After the project is created, get your connection string from the dashboard
4. The connection string will look like: `postgresql://username:password@endpoint-id.region.aws.neon.tech/database`

## Step 3: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Set up Authentication (enable Email/Password authentication)
4. Go to Project Settings > General tab to find your Web API Key and App ID
5. Go to Project Settings > Service Accounts tab to generate a new private key

## Step 4: Set Up Stripe Account

1. Sign up for a [Stripe](https://stripe.com) account
2. Go to Developers > API Keys
3. Copy your publishable key and secret key

## Step 5: Configure Environment Variables

1. Create a `.env` file in the root directory (or edit the existing one)
2. Add the following variables:

```
# Database connection
DATABASE_URL=your_neon_connection_string_here
NODE_ENV=development

# Session management
SESSION_SECRET=a_random_secure_string_for_sessions

# Stripe integration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key_here

# Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Firebase Web SDK (client-side)
VITE_FIREBASE_API_KEY=your_firebase_web_api_key_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Set Up the Database

This will create all the database tables defined in the schema:

```bash
npm run db:setup
```

## Step 8: Seed the Database

This will populate the database with sample data:

```bash
npm run db:seed
```

## Step 9: Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5000

## Automated Setup (Windows)

If you're on Windows, we've created a batch file to automate steps 6-9:

```bash
scripts\full-setup.bat
```

## Deploying to Netlify

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to [Netlify](https://app.netlify.com/)

3. Click "New site from Git" and select your repository

4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

5. Add the following environment variables in Netlify's "Site settings > Environment variables":
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `STRIPE_SECRET_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_STRIPE_PUBLIC_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

6. Deploy your site

## Troubleshooting

### Database Connection Issues

- Make sure your Neon database is created and running
- Verify that the DATABASE_URL in your .env file is correct
- Check if your IP address is allowed in Neon's connection settings
- For Netlify deployment, ensure your Neon database allows connections from Netlify's IP ranges

### Missing Tables or Data

If you're not seeing data in the application:

1. Make sure the database setup and seed scripts completed successfully
2. Check the server logs for any database query errors
3. Try running the setup and seed scripts manually:
   ```
   npm run db:setup
   npm run db:seed
   ```

### Firebase Authentication Issues

- Verify your Firebase credentials in the .env file
- Make sure your Firebase project has authentication enabled
- Check that the web app is registered in your Firebase project
- For Netlify deployment, add your Netlify site URL to the authorized domains in Firebase Console

### Stripe Integration Issues

- Make sure you're using the correct API keys (test keys for development, live keys for production)
- Verify that both the server-side secret key and client-side publishable key are set correctly

## Data Model

The application uses the following main data entities:

- **Users**: Application users (admin, organizers, attendees)
- **Events**: Information about events, including date, venue, capacity, etc.
- **Venues**: Locations where events can be hosted
- **Bookings**: Reservations for events
- **Attendees**: Individuals attending events
- **Vendors**: Service providers for events

## Front-end Data Display

The application has several key pages for data management:

- **Dashboard**: Overview of events, bookings, attendees
- **Events**: List and manage events
- **Attendee Management**: Register and manage event attendees
- **Vendor Management**: Manage service providers
- **Live Tracking**: Real-time monitoring of event attendance

For more information, please refer to the README.md file. 