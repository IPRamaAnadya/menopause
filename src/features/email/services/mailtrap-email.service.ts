import nodemailer, { Transporter } from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { IEmailService } from '../interfaces/IEmailService';
import { SendEmailOptions, EmailSendResult, EmailAddress } from '../types/email.types';

/**
 * Mailtrap email service implementation using nodemailer
 * Perfect for development and testing emails
 */
export class MailtrapEmailService implements IEmailService {
  private transporter: Transporter;
  private token: string;
  private testInboxId: number;

  constructor() {
    this.token = process.env.MAILTRAP_API_TOKEN || '';
    this.testInboxId = parseInt(process.env.MAILTRAP_TEST_INBOX_ID || '0', 10);

    // Create nodemailer transporter with MailtrapTransport
    this.transporter = nodemailer.createTransport(
      MailtrapTransport({
        token: this.token,
        sandbox: true,
        testInboxId: this.testInboxId,
      })
    );
  }

  /**
   * Send a single email via Mailtrap
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


      // Prepare email data, ensuring from/to/cc/bcc/replyTo are not arrays
      const mailOptions = {
        from: this.formatSingleEmailAddress(options.from),
        to: this.formatSingleEmailAddress(options.to),
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc ? this.formatSingleEmailAddress(options.cc) : undefined,
        bcc: options.bcc ? this.formatSingleEmailAddress(options.bcc) : undefined,
        replyTo: options.replyTo ? this.formatSingleEmailAddress(options.replyTo) : undefined,
        attachments: options.attachments,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      console.log('[Mailtrap] Email sent successfully:', {
        messageId: info.messageId,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('[Mailtrap] Error sending email:', error);
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
    const results: EmailSendResult[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Add small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Verify Mailtrap connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Check if required credentials are configured
      if (!this.token || !this.testInboxId) {
        console.warn('[Mailtrap] Missing API token or test inbox ID');
        return false;
      }

      console.log('[Mailtrap] Connection configured successfully');
      return true;
    } catch (error) {
      console.error('[Mailtrap] Connection verification failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'mailtrap';
  }

  /**
   * Format email address for nodemailer
   */
  private formatEmailAddress(
    address: string | string[] | EmailAddress | EmailAddress[]
  ): string | { name: string; address: string } | Array<string | { name: string; address: string }> {
    if (Array.isArray(address)) {
      // Flatten the result to avoid nested arrays
      return address
        .map((item) => this.formatEmailAddress(item))
        .flat();
    }
    if (typeof address === 'string') {
      return address;
    }
    return {
      name: address.name || address.email,
      address: address.email,
    };
  }

  /**
   * Format a single email address for nodemailer (string | {name, address})
   * If array, join as comma-separated string
   */
  private formatSingleEmailAddress(
    address: string | string[] | EmailAddress | EmailAddress[]
  ): string | { name: string; address: string } | undefined {
    if (!address) return undefined;
    if (Array.isArray(address)) {
      // Convert each to string or {name, address}, then join as comma-separated string
      return address
        .map((item) => {
          if (typeof item === 'string') return item;
          return item.name ? `"${item.name}" <${item.email}>` : item.email;
        })
        .join(', ');
    }
    if (typeof address === 'string') {
      return address;
    }
    return address.name ? `"${address.name}" <${address.email}>` : address.email;
  }

  /**
   * Close the transporter connection
   */
  async close(): Promise<void> {
    this.transporter.close();
  }
}
