import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import session from 'express-session';
import { registerRoutes } from '../../server/routes';
import { setupAuth } from '../../server/auth';
import { json, urlencoded } from 'body-parser';

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Set session secret
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'eventzen-secret-key';
  console.warn('No SESSION_SECRET environment variable set, using default (unsafe for production)');
}

// Setup authentication
setupAuth(app);

// Register all routes
registerRoutes(app);

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

// Export the serverless function
export const handler = serverless(app);