@echo off
echo =============================================
echo EventZen Setup Script
echo =============================================
echo This script will set up your EventZen application.
echo Make sure you have updated your .env file with all required variables:
echo.
echo 1. DATABASE_URL (Neon PostgreSQL connection string)
echo 2. SESSION_SECRET (for secure sessions)
echo 3. STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY (for payments)
echo 4. Firebase variables:
echo    - FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
echo    - VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID, VITE_FIREBASE_PROJECT_ID
echo =============================================

:: Check if .env file exists
if not exist .env (
  echo ERROR: .env file not found. Please create one with required variables.
  exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Create the database tables
echo Setting up database tables...
call npm run db:setup

:: Seed the database with sample data
echo Seeding the database with sample data...
call npm run db:seed

:: Start the development server
echo Starting the development server...
echo You can access the application at http://localhost:5000
call npm run dev 