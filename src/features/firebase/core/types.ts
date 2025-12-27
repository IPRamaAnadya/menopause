import { FirebaseApp } from 'firebase/app';
import { Analytics } from 'firebase/analytics';
import { Auth } from 'firebase/auth';

/**
 * Firebase configuration interface
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

/**
 * Firebase service interface
 */
export interface IFirebaseService {
  getApp(): FirebaseApp;
  getAnalytics(): Analytics | null;
  getAnalyticsAsync(): Promise<Analytics | null>;
  getAuth(): Auth;
}
