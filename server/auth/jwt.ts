import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { admin } from './firebase-admin';
import { storage } from '../storage';

// Secret used to sign JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'eventzen-jwt-secret';
const TOKEN_EXPIRES_IN = '7d'; // Token expires in 7 days

interface DecodedToken {
  uid: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

// Create a JWT token from a Firebase ID token
export const createJWT = async (firebaseToken: string): Promise<string> => {
  try {
    // Verify the Firebase token
    const decodedFirebaseToken = await admin.auth().verifyIdToken(firebaseToken);
    
    // Get user from database to include role
    const user = await storage.getUserByFirebaseUid(decodedFirebaseToken.uid);
    
    // Payload for our JWT
    const payload = {
      uid: decodedFirebaseToken.uid,
      email: decodedFirebaseToken.email,
      role: user?.role || 'user'
    };
    
    // Create and sign the JWT
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  } catch (error) {
    console.error('Error creating JWT:', error);
    throw new Error('Failed to create JWT token');
  }
};

// Middleware to verify JWT token
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }
  
  const token = authHeader.split(' ')[1]; // Get token from "Bearer token"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    // Add user info to request
    req.user = { uid: decoded.uid, role: decoded.role || 'user' } as any;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};