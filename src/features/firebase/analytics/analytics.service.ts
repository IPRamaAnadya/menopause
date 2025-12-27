import { Analytics, logEvent as firebaseLogEvent, setUserId as firebaseSetUserId, setUserProperties as firebaseSetUserProperties } from 'firebase/analytics';
import { IAnalyticsService, AnalyticsEventParams } from './analytics.interface';
import { firebase } from '../core';

/**
 * Firebase Analytics Service Implementation
 * Implements the IAnalyticsService interface
 */
export class FirebaseAnalyticsService implements IAnalyticsService {
  private analytics: Analytics | null = null;
  private analyticsReady = false;

  constructor() {
    // Initialize analytics asynchronously
    this.initAnalytics();
  }

  private async initAnalytics(): Promise<void> {
    try {
      this.analytics = await firebase.getAnalyticsAsync();
      this.analyticsReady = !!this.analytics;
      
      if (this.analyticsReady) {
        console.log('Firebase Analytics Service initialized');
      } else {
        console.warn('Firebase Analytics not available');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics Service:', error);
    }
  }

  private ensureAnalytics(): Analytics | null {
    if (!this.analyticsReady || !this.analytics) {
      console.warn('Analytics not initialized yet or not supported');
      return null;
    }
    return this.analytics;
  }

  public logEvent(eventName: string, params?: AnalyticsEventParams): void {
    const analytics = this.ensureAnalytics();
    if (!analytics) return;

    try {
      firebaseLogEvent(analytics, eventName, params);
      console.log(`Analytics event logged: ${eventName}`, params);
    } catch (error) {
      console.error(`Failed to log event ${eventName}:`, error);
    }
  }

  public logPageView(pagePath: string, pageTitle?: string): void {
    this.logEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle || pagePath,
    });
  }

  public setUserId(userId: string): void {
    const analytics = this.ensureAnalytics();
    if (!analytics) return;

    try {
      firebaseSetUserId(analytics, userId);
      console.log(`Analytics userId set: ${userId}`);
    } catch (error) {
      console.error('Failed to set userId:', error);
    }
  }

  public setUserProperties(properties: Record<string, string>): void {
    const analytics = this.ensureAnalytics();
    if (!analytics) return;

    try {
      firebaseSetUserProperties(analytics, properties);
      console.log('Analytics user properties set:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  public logPurchase(transactionId: string, value: number, currency: string = 'USD'): void {
    this.logEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
    });
  }

  /**
   * Check if analytics is ready
   */
  public isReady(): boolean {
    return this.analyticsReady;
  }

  /**
   * Wait for analytics to be ready
   */
  public async waitForReady(): Promise<boolean> {
    if (this.analyticsReady) return true;

    // Wait for analytics to initialize (max 5 seconds)
    const maxWait = 5000;
    const startTime = Date.now();

    while (!this.analyticsReady && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.analyticsReady;
  }
}

// Export singleton instance
let analyticsServiceInstance: FirebaseAnalyticsService | null = null;

export const getAnalyticsService = (): FirebaseAnalyticsService => {
  if (typeof window === 'undefined') {
    throw new Error('Analytics service can only be used in browser environment');
  }

  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new FirebaseAnalyticsService();
  }
  return analyticsServiceInstance;
};
