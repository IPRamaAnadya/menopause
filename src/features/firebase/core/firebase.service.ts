import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { IFirebaseService } from './types';
import { getFirebaseConfig } from './config';

/**
 * Firebase service implementation
 * Singleton pattern to ensure only one Firebase instance
 */
class FirebaseService implements IFirebaseService {
  private app: FirebaseApp;
  private analytics: Analytics | null = null;
  private analyticsPromise: Promise<Analytics | null> | null = null;
  private auth: Auth;

  constructor() {
    const config = getFirebaseConfig();

    // Initialize Firebase app (singleton pattern)
    if (!getApps().length) {
      this.app = initializeApp(config);
    } else {
      this.app = getApps()[0];
    }

    // Initialize Auth
    this.auth = getAuth(this.app);

    // Initialize Analytics (only in browser)
    if (typeof window !== 'undefined') {
      this.analyticsPromise = this.initializeAnalytics();
    }
  }

  private async initializeAnalytics(): Promise<Analytics | null> {
    try {
      const supported = await isSupported();
      if (supported) {
        this.analytics = getAnalytics(this.app);
        console.log('Firebase Analytics initialized successfully');
        return this.analytics;
      }
      console.warn('Firebase Analytics is not supported in this environment');
      return null;
    } catch (error) {
      console.error('Firebase Analytics initialization error:', error);
      return null;
    }
  }

  public getApp(): FirebaseApp {
    return this.app;
  }

  public getAnalytics(): Analytics | null {
    return this.analytics;
  }

  public async getAnalyticsAsync(): Promise<Analytics | null> {
    if (this.analyticsPromise) {
      await this.analyticsPromise;
    }
    return this.analytics;
  }

  public getAuth(): Auth {
    return this.auth;
  }
}

// Export singleton instance
let firebaseServiceInstance: FirebaseService | null = null;

export const getFirebaseService = (): FirebaseService => {
  if (!firebaseServiceInstance) {
    firebaseServiceInstance = new FirebaseService();
  }
  return firebaseServiceInstance;
};

// Export for convenience
export const firebase = {
  getApp: () => getFirebaseService().getApp(),
  getAnalytics: () => getFirebaseService().getAnalytics(),
  getAnalyticsAsync: () => getFirebaseService().getAnalyticsAsync(),
  getAuth: () => getFirebaseService().getAuth(),
};
