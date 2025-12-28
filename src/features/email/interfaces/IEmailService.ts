import { SendEmailOptions, EmailSendResult } from '../types/email.types';

/**
 * Email service interface
 * Implement this interface to create a new email service provider
 */
export interface IEmailService {
  /**
   * Send a single email
   * @param options Email options including recipient, subject, content, etc.
   * @returns Promise with send result
   */
  sendEmail(options: SendEmailOptions): Promise<EmailSendResult>;

  /**
   * Send multiple emails in batch
   * @param emails Array of email options
   * @returns Promise with array of send results
   */
  sendBatchEmails(emails: SendEmailOptions[]): Promise<EmailSendResult[]>;

  /**
   * Verify email service configuration and connection
   * @returns Promise with boolean indicating if service is ready
   */
  verifyConnection(): Promise<boolean>;

  /**
   * Get the name of the email service provider
   * @returns Service provider name (e.g., 'mailgun', 'sendgrid', 'ses')
   */
  getProviderName(): string;
}
