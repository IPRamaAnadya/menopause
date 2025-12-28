/**
 * Default email service instance
 * This provides a convenient singleton for email operations
 */
import { EmailServiceFactory } from './email.factory';

export const emailService = EmailServiceFactory.getDefaultService();
