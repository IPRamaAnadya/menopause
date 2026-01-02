/**
 * Default email service instance
 * This provides a convenient singleton for email operations
 */
import { EmailServiceFactory } from './email.factory';
import { EmailTemplates } from '../templates/email-templates';

export const emailService = EmailServiceFactory.getDefaultService();

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  locale: string = 'en'
) {
  const userName = email.split('@')[0]; // Use email prefix as name if not provided
  const template = EmailTemplates.emailVerification({
    name: userName,
    verificationUrl,
    locale,
  });

  await emailService.sendEmail({
    from: process.env.EMAIL_FROM || 'noreply@menopause.hk',
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
