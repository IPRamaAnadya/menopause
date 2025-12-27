// Core Firebase exports
export { firebase, getFirebaseService, getFirebaseConfig } from './core';
export type { FirebaseConfig, IFirebaseService } from './core';

// Auth exports
export type { IAuthService } from './auth';
export { FirebaseAuthService, getAuthService } from './auth';

// Analytics exports
export type { IAnalyticsService, AnalyticsEventParams } from './analytics';
export { FirebaseAnalyticsService, getAnalyticsService } from './analytics';
