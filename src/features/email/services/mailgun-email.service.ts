import { IEmailService } from '../interfaces/IEmailService';
import { SendEmailOptions, EmailSendResult, EmailAddress } from '../types/email.types';

/**
 * Mailgun email service implementation
 * Note: API integration not implemented yet
 */
export class MailgunEmailService implements IEmailService {
  private apiKey: string;
  private domain: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY || '';
    this.domain = process.env.MAILGUN_DOMAIN || '';
    this.apiUrl = process.env.MAILGUN_API_URL || 'https://api.mailgun.net/v3';
  }

  /**
   * Send a single email via Mailgun
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Validate required fields
      if (!options.to || !options.from || !options.subject) {
        return {
          success: false,
          error: 'Missing required fields: to, from, or subject',
        };
      }

      if (!options.html && !options.text) {
        return {
          success: false,
          error: 'Either html or text content is required',
        };
      }

      // TODO: Implement actual Mailgun API call here
      // For now, just log and return success
      console.log('[Mailgun] Would send email:', {
        to: this.formatEmailAddress(options.to),
        from: this.formatEmailAddress(options.from),
        subject: options.subject,
      });

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } catch (error) {
      console.error('[Mailgun] Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send multiple emails in batch
   */
  async sendBatchEmails(emails: SendEmailOptions[]): Promise<EmailSendResult[]> {
    // TODO: Implement batch sending with Mailgun
    // For now, send sequentially
    const results: EmailSendResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Verify Mailgun configuration and connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Check if required environment variables are set
      if (!this.apiKey || !this.domain) {
        console.warn('[Mailgun] Missing API key or domain configuration');
        return false;
      }

      // TODO: Implement actual connection verification with Mailgun API
      console.log('[Mailgun] Connection verification not implemented yet');
      return true;
    } catch (error) {
      console.error('[Mailgun] Connection verification failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'mailgun';
  }

  /**
   * Helper method to format email addresses
   */
  private formatEmailAddress(
    address: EmailAddress | EmailAddress[] | string | string[]
  ): string | string[] {
    if (Array.isArray(address)) {
      return address.map((addr) => this.formatSingleAddress(addr));
    }
    return this.formatSingleAddress(address);
  }

  /**
   * Helper method to format a single email address
   */
  private formatSingleAddress(address: EmailAddress | string): string {
    if (typeof address === 'string') {
      return address;
    }
    return address.name ? `${address.name} <${address.email}>` : address.email;
  }
}
