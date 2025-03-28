import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { z } from "zod";
import {
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { 
  registerWithEmailAndPassword, 
  loginWithEmailAndPassword, 
  signInWithGoogle, 
  logOut, 
  onUserAuthStateChange 
} from "@/firebase/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Enhanced User type with Firebase uid
interface User {
  id: number;
  uid: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  photoURL?: string;
}

// Define login and register data schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Create default values for AuthContext
const defaultContextValue = {
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async () => {},
};

// Enhanced AuthContext with Google signin
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: z.infer<typeof loginSchema>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: z.infer<typeof registerSchema>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(defaultContextValue as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to authenticate with our backend using Firebase token
  const authenticateWithBackend = async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
    try {
      // Check for mock user authentication in development
      const mockUserAuth = window.sessionStorage.getItem('mockUserAuthenticated');
      if (import.meta.env.DEV && mockUserAuth === 'true') {
        console.log("Using mock user authentication");
        return {
          id: 1,
          uid: 'mock-uid-123',
          username: 'MockUser',
          email: 'mock@example.com',
          firstName: 'Mock',
          lastName: 'User',
          role: 'user',
          photoURL: 'https://via.placeholder.com/150',
        };
      }
      
      // For regular Firebase authentication
      if (!firebaseUser) {
        return null;
      }
      
      // Get the Firebase token
      const token = await firebaseUser.getIdToken();
      
      // Send the token to our backend to verify and create/get user
      const response = await apiRequest('POST', '/api/auth/verify-token', { token });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      
      // If in development and backend call fails, use mock data
      if (import.meta.env.DEV) {
        console.log("Using fallback mock user (backend call failed)");
        return {
          id: 1,
          uid: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user1',
          email: firebaseUser.email || 'user@example.com',
          firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
          lastName: firebaseUser.displayName?.split(' ')[1] || 'Name',
          role: 'user',
          photoURL: firebaseUser.photoURL || undefined,
        };
      }
      
      return null;
    } catch (err) {
      console.error('Error authenticating with backend:', err);
      
      // If in development, use mock data
      if (import.meta.env.DEV) {
        console.log("Using fallback mock user (error occurred)");
        return {
          id: 1,
          uid: 'error-recovery-uid',
          username: 'ErrorUser',
          email: 'error@example.com',
          firstName: 'Error',
          lastName: 'Recovery',
          role: 'user',
          photoURL: undefined,
        };
      }
      
      return null;
    }
  };

  // Set up Firebase auth state listener
  useEffect(() => {
    // Check for mock user authentication in development
    const checkMockAuth = async () => {
      const mockUserAuth = window.sessionStorage.getItem('mockUserAuthenticated');
      
      if (import.meta.env.DEV && mockUserAuth === 'true') {
        console.log("Found mock auth session");
        const mockUser = await authenticateWithBackend(null);
        if (mockUser) {
          setUser(mockUser);
        }
        setIsLoading(false);
        return true;
      }
      return false;
    };
    
    // Check for mock auth first
    checkMockAuth().then(hasMockAuth => {
      // Only set up Firebase listener if no mock auth
      if (!hasMockAuth) {
        const unsubscribe = onUserAuthStateChange(async (firebaseUser) => {
          setIsLoading(true);
          
          try {
            if (firebaseUser) {
              // User is signed in, authenticate with our backend
              const appUser = await authenticateWithBackend(firebaseUser);
              if (appUser) {
                setUser(appUser);
              }
            } else {
              // User is signed out
              setUser(null);
            }
          } catch (err) {
            console.error('Auth state change error:', err);
          } finally {
            setIsLoading(false);
          }
        });
        
        // Store unsubscribe function for cleanup
        return () => unsubscribe();
      }
      
      // No cleanup needed for mock auth
      return () => {};
    });
  }, []);

  // Login with email and password
  const login = async (credentials: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call Firebase authentication
      await loginWithEmailAndPassword(credentials.email, credentials.password);
      
      // Auth state listener will update the user state
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call Firebase Google authentication
      await signInWithGoogle();
      
      // Auth state listener will update the user state
      toast({
        title: "Google login successful",
        description: "Welcome!",
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Google login failed";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register with email and password
  const register = async (userData: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Register with Firebase
      await registerWithEmailAndPassword(userData.email, userData.password);
      
      // Auth state listener will handle creating the user in our database
      toast({
        title: "Registration successful",
        description: "Your account has been created. Welcome!",
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call Firebase logout
      await logOut();
      
      // Auth state listener will update the user state
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
