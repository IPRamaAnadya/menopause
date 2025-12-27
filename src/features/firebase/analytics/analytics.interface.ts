/**
 * Analytics event parameters
 */
export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Analytics service interface
 * Defines the contract for analytics operations
 */
export interface IAnalyticsService {
  // Event tracking
  logEvent(eventName: string, params?: AnalyticsEventParams): void;

  // Page tracking
  logPageView(pagePath: string, pageTitle?: string): void;

  // User properties
  setUserId(userId: string): void;
  setUserProperties(properties: Record<string, string>): void;

  // E-commerce
  logPurchase(transactionId: string, value: number, currency?: string): void;
}
