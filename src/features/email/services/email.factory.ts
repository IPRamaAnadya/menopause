import { IEmailService } from '../interfaces/IEmailService';
import { MailgunEmailService } from './mailgun-email.service';
import { MailtrapEmailService } from './mailtrap-email.service';

/**
 * Email service provider types
 */
export enum EmailProvider {
  MAILGUN = 'mailgun',
  MAILTRAP = 'mailtrap',
  // Add more providers as needed:
  // SENDGRID = 'sendgrid',
  // AWS_SES = 'aws-ses',
  // SMTP = 'smtp',
}

/**
 * Factory class to create email service instances
 * Makes it easy to swap between different email providers
 */
export class EmailServiceFactory {
  /**
   * Create an email service instance based on the provider
   * @param provider Email provider to use (defaults to environment variable or mailgun)
   * @returns Email service instance
   */
  static create(provider?: EmailProvider): IEmailService {
    const activeProvider =
      provider ||
      (process.env.EMAIL_PROVIDER as EmailProvider) ||
      EmailProvider.MAILTRAP;

    switch (activeProvider) {
      case EmailProvider.MAILTRAP:
        return new MailtrapEmailService();
      
      case EmailProvider.MAILGUN:
        return new MailgunEmailService();
      
      // Add more providers here:
      // case EmailProvider.SENDGRID:
      //   return new SendGridEmailService();
      // case EmailProvider.AWS_SES:
      //   return new AwsSesEmailService();
      
      default:
        console.warn(
          `[EmailFactory] Unknown provider: ${activeProvider}, falling back to Mailtrap`
        );
        return new MailtrapEmailService();
    }
  }

  /**
   * Get the default email service instance
   * This is the main method to use throughout the application
   */
  static getDefaultService(): IEmailService {
    return this.create();
  }
}
