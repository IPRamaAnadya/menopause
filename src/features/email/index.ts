/**
 * Email feature exports
 * This is the main entry point for the email feature
 */

// Services
export { EmailServiceFactory, EmailProvider } from './services/email.factory';
export { MailgunEmailService } from './services/mailgun-email.service';

// Interfaces
export type { IEmailService } from './interfaces/IEmailService';

// Types
export type {
  EmailAddress,
  EmailAttachment,
  SendEmailOptions,
  EmailSendResult,
  EmailTemplate,
} from './types/email.types';
export { EmailTemplateType } from './types/email.types';

// Templates
export { EmailTemplates } from './templates/email-templates';

// Usage example:
// import { EmailServiceFactory, EmailTemplates } from '@/features/email';
// 
// const emailService = EmailServiceFactory.getDefaultService();
// const template = EmailTemplates.welcome({ name: 'John', loginUrl: 'https://...' });
// 
// await emailService.sendEmail({
//   to: 'user@example.com',
//   from: 'noreply@menopause.org',
//   subject: template.subject,
//   html: template.html,
//   text: template.text,
// });
