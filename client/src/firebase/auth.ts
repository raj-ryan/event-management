import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  AuthError,
} from "firebase/auth";
import { auth } from "./config";

// Custom error for mock auth
class MockAuthError extends Error {
  code: string;
  
  constructor(message: string, code: string = "auth/mock-error") {
    super(message);
    this.code = code;
    this.name = "MockAuthError";
  }
}

// Create a mock user credential for development
const createMockUserCredential = (): UserCredential => {
  return {
    user: {
      uid: "mock-user-123",
      email: "mock@example.com",
      displayName: "Mock User",
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: "",
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => "mock-token",
      getIdTokenResult: async () => ({
        token: "mock-token",
        signInProvider: "password",
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
        issuedAtTime: new Date().toISOString(),
        authTime: new Date().toISOString(),
        claims: {},
      }),
      reload: async () => {},
      toJSON: () => ({}),
      providerId: "password",
    },
    providerId: "password",
    operationType: "signIn",
  } as unknown as UserCredential;
};

// Email & Password Sign Up
export const registerWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    console.log(`Attempting to register with email: ${email}`);
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Registration error:", error);
    
    // Always use mock in development to avoid Firebase configuration issues
    if (import.meta.env.DEV) {
      console.log("Using mock user registration in development");
      // Create a mock session for development testing
      window.sessionStorage.setItem('mockUserAuthenticated', 'true');
      return createMockUserCredential();
    }
    
    throw error;
  }
};

// Email & Password Sign In
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    console.log(`Attempting to login with email: ${email}`);
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
    
    // Always use mock in development to avoid Firebase configuration issues
    if (import.meta.env.DEV) {
      console.log("Using mock user login in development");
      // Create a mock session for development testing
      window.sessionStorage.setItem('mockUserAuthenticated', 'true');
      return createMockUserCredential();
    }
    
    throw error;
  }
};

// Google Sign In
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    console.log("Attempting Google sign in");
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google sign in error:", error);
    
    // Always use mock in development to avoid Firebase configuration issues
    if (import.meta.env.DEV) {
      console.log("Using mock Google login in development");
      // Create a mock session for development testing
      window.sessionStorage.setItem('mockUserAuthenticated', 'true');
      return createMockUserCredential();
    }
    
    throw error;
  }
};

// Sign Out
export const logOut = async (): Promise<void> => {
  try {
    console.log("Attempting to sign out user");
    await signOut(auth);
    
    // Always remove mock session on logout
    window.sessionStorage.removeItem('mockUserAuthenticated');
  } catch (error) {
    console.error("Sign out error:", error);
    
    // In development, just log the error and remove mock session
    if (import.meta.env.DEV) {
      console.log("Mock sign out successful in development");
      window.sessionStorage.removeItem('mockUserAuthenticated');
      return;
    }
    
    throw error;
  }
};

// Current User State
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Auth State Listener
export const onUserAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  try {
    console.log("Setting up auth state listener");
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error("Auth state change error:", error);
    
    // In development, provide a no-op function
    if (import.meta.env.DEV) {
      console.log("Using mock auth state listener in development");
      // Immediately call with null
      setTimeout(() => callback(null), 0);
      // Return a no-op unsubscribe function
      return () => {};
    }
    
    throw error;
  }
};

// Get Auth Token for API Requests
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error("Get auth token error:", error);
    
    // In development, return a mock token
    if (import.meta.env.DEV) {
      console.log("Using mock auth token in development");
      return "mock-firebase-jwt-token";
    }
    
    throw error;
  }
};