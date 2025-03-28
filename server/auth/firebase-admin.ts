/**
 * This file provides a mock Firebase Admin SDK for development purposes.
 * In production, you would use the actual Firebase Admin SDK with proper credentials.
 */

// Mock user interface
export interface MockUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// Mock decoded token interface
export interface DecodedToken {
  uid: string;
  [key: string]: any;
}

// Create mock admin functions
export const admin = {
  auth: () => ({
    verifyIdToken: async (token: string): Promise<DecodedToken> => {
      // Mock implementation that doesn't actually verify tokens
      // but returns a mock user ID
      console.log("Mock verifyIdToken called with token length:", token?.length || 0);
      return { uid: 'mock-user-123' };
    },
    getUser: async (uid: string): Promise<MockUser> => {
      // Mock user data
      console.log("Mock getUser called with uid:", uid);
      return {
        uid,
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: null
      };
    }
  })
};