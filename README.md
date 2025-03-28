# EventZen

A dynamic event management platform that provides an intuitive and engaging user experience for creating, booking, and exploring events with cutting-edge technology.

## Features

- Event creation and management
- Venue booking and management
- User authentication with Firebase
- Real-time notifications via WebSockets
- Payment processing with Stripe
- Admin dashboard for event analytics

## Tech Stack

- **Frontend**: React.js, TailwindCSS, Shadcn UI
- **Backend**: Express.js, WebSocket
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth, Passport.js
- **Payments**: Stripe
- **Deployment**: Docker, Netlify

## Getting Started

### Prerequisites

- Node.js 20.x
- Docker and Docker Compose
- PostgreSQL database
- Firebase account
- Stripe account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/eventzen.git
   cd eventzen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in the environment variables in the `.env` file.

5. Run the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. The application will be available at `http://localhost:3000`.

#### Docker WebSocket Configuration

The WebSocket server is configured to work in both development and production Docker environments:

- In development, the WebSocket connection is established through the main application.
- In production, the WebSocket server runs separately in the Netlify Functions container.

To test WebSocket functionality in the Docker environment, you can access the health endpoint at:
```
http://localhost:8888/.netlify/functions/ws/health
```

WebSocket clients should connect to:
```
ws://localhost:8888/.netlify/functions/ws
```

## Netlify Deployment

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

### Netlify Functions Deployment with Docker

The Netlify functions can be deployed separately using Docker:

1. Navigate to the netlify directory:
   ```bash
   cd netlify
   ```

2. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

3. The Netlify functions will be available at `http://localhost:8888/.netlify/functions/api` and `http://localhost:8888/.netlify/functions/ws`.

### CI/CD with GitHub Actions

This project is configured for CI/CD with GitHub Actions. To use it:

1. Push your code to GitHub.
2. Set up the following secrets in your GitHub repository:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
   - `NETLIFY_SITE_ID`: Your Netlify site ID
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password
   - `DATABASE_URL`: PostgreSQL connection string
   - `VITE_FIREBASE_API_KEY`: Firebase API key
   - `VITE_FIREBASE_APP_ID`: Firebase app ID
   - `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
   - `VITE_STRIPE_PUBLIC_KEY`: Stripe public key
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `SESSION_SECRET`: Secret for session encryption

The GitHub Actions workflow will automatically build and deploy your application to both Netlify and Docker Hub on every push to the main branch.

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_APP_ID`: Firebase app ID
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `SESSION_SECRET`: Secret for session encryption