import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, User, onAuthStateChanged } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project'}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock-app-id',
};

// Log configuration for debugging
console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "[PRESENT]" : "[MISSING]",
});

// Initialize Firebase
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw new Error('Failed to initialize Firebase');
}

// Initialize Firebase Authentication
let auth: Auth;
try {
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
} catch (error) {
  console.error("Firebase auth initialization error:", error);
  throw new Error('Failed to initialize Firebase Auth');
}

export { auth };
export default app;