import * as admin from 'firebase-admin';

// Initialize Firebase Admin with service account credentials
// In a production environment, you would use a service account key JSON file
// For Replit, we'll use environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-${process.env.VITE_FIREBASE_PROJECT_ID}@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
      // For development, we'll use a fake private key that works with the Firebase Auth Emulator
      // In production, you should set the proper private key as an environment variable
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCXaF5vCZT6Gf+j\nNbS9M1wPXfbU1JlkWE7EFAUQs3Q3jSvmTaWt8ro9iHDVRYrsikhRuvmFUcPfxQKp\nIkhwLx/L4JYdtQc2FxJKaBUKNVEQf5ZiTbtY9/2xqXJG6PjEoF32p1wQiOqSJJqF\ndT8/nTi7e+RbcjQz+jvQlpYrTNDG1IlT0wGUprYwhd4bSr/JYFiL9e0azBdcGrGr\nF13FQK0Q6dwMKRbwbcxKiwj4WtBcNW+eRQjnOemwZ/YKr9wlnTHXlPB06nXhfVFc\nNqP2SbIHIefPr4MiG4k/9a5YyPm+AV+P0ZnTlhQ89phcWyPQXv7JXmBI+q1cnB49\nTN8iBVa1AgMBAAECggEABiTAF7t6tPvvHyD33UjVlTtLUw+uyCPZ4ZExZSRCBFT+\nzrQm0HBjNv3C9+RZx4bMIrA9kmoYL4Cldh8zKMUtJuAJZZTshLkBKyDyzYDKWOFK\nnTjVbXHSJYekOVLvrmJBZ9y9ofI4QhwIalN499WbO7N7T7hvjbY4xnA3PvrgXCJk\noP0ONgLQeOcmQjZdEhjdDXoJNidmWnEpCuJHQRRBpx+XwaiCQeyH2dA7LBwpIZXy\nxMPc12SfBVYfhFYTcKNInkWLrSWJFcbcAFmzWPG4x6T8A8zSBHN8D5BP7dskh6gi\nDGCbzYwRYX4nIqJ1yW9hHAONdJMWRBpGHFnPc4zQwQKBgQDVA4UueTMLnpHfyRTd\nsvLH5hBs/Y9DIvtUYUh3fMdQXIE/nZjcpJvGEIbPNq9NB4hCE6m1YF4reebFZtQP\njJgaCTZzL4qBm37MhwTeHqyOfT6Pj+nfJTn+WGbp/mkQmXVOO3PDRL4sTGrj2VCm\n0OAgJe0unTWkj67KGZCh+5O0EQKBgQC1pZoKbAHwM9q4XpI2wkQLJyntIMabMw5o\nZOyK5Qrgu9M77TpLBnQn+4bzisxfKNdQQKwgcLRyy3mLDwCwCWM7c/bTCpd3xIY6\n0fFfq/uL/cvjdBfkX8p4gIIuNnBpxEXcIVNZ9r+4vk2DpCRu3lFk2ClKdvZbQRbq\nVJQEHO65dQKBgQCFAh0ZHpOOVQ3I5XZCcVjOxtRDzn1M7x9fKXLyEIi7EkIzMPSu\nGm5qZbCbhXRnkT+TFqM9jVNqtXCfP9WaO5pBS3yGW4KGHH0A60eCesHp7Q95axs1\nA/I1i6Q1vhhiQPu2/skLRdWYvW7RJ6ZKdJKyEN8DPkN+7wPbMZYztTh1UQKBgGpF\nwu2J/JBMZuHEu38IHvfxo3PD76TLEylXx3R6mR/9yGE+iWFNvsFKvXTiWXPnFPvj\nSMDQdJRYKTdoUYJhCwXb+MqoEXBlw8mJgwvMKFEOQS5fUXI0dyxHh2TLozdWcXLr\nIzm0TW+THnw+KHgPPPtLa8YDtJYONxJoKNKUH9tFAoGADZTFPm85RYRzpM1Z8JT9\n7TbcRRmdsPUCQ1jLXrEzH6SnOgeGnm4irX5piYQYz7CuvpOXEaVQj6yGvLw0BPU6\nXtegQEr8RnVvSplI+/NcyZSXwi+wVAMTZ3i4VGnp1IL5U5KCdwQ8kJX6WQKIjxJR\n7xJwDiHCu5dTcPsP1MSR9Ok=\n-----END PRIVATE KEY-----\n'
    }),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

export { admin };