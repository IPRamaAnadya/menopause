import { FirebaseConfig } from './types';

/**
 * Get Firebase configuration from environment variables
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  const config: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  };

  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingFields.join(', ')}`
    );
  }

  return config;
};
