import { EmailTemplate, EmailTemplateType } from '../types/email.types';

/**
 * Email template generator functions
 * Create HTML and text versions of emails
 */
export class EmailTemplates {
  /**
   * Generate welcome email template
   */
  static welcome(data: { name: string; loginUrl: string }): EmailTemplate {
    return {
      subject: 'Welcome to Hong Kong Menopause Society',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome, ${data.name}!</h1>
          <p>Thank you for joining the Hong Kong Menopause Society.</p>
          <p>Your account has been successfully created with a free membership.</p>
          <p>
            <a href="${data.loginUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px;">
              Login to Your Account
            </a>
          </p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
      `,
      text: `Welcome, ${data.name}!\n\nThank you for joining the Hong Kong Menopause Society.\nYour account has been successfully created with a free membership.\n\nLogin here: ${data.loginUrl}`,
    };
  }

  /**
   * Generate password reset email template
   */
  static passwordReset(data: { name: string; resetUrl: string; expiryHours: number }): EmailTemplate {
    return {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>Hello ${data.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p>
            <a href="${data.resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link will expire in ${data.expiryHours} hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Reset Your Password\n\nHello ${data.name},\n\nWe received a request to reset your password.\nClick here to reset: ${data.resetUrl}\n\nThis link will expire in ${data.expiryHours} hours.`,
    };
  }

  /**
   * Generate membership confirmation email template
   */
  static membershipConfirmation(data: {
    name: string;
    membershipLevel: string;
    startDate: string;
    endDate: string;
  }): EmailTemplate {
    return {
      subject: 'Membership Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Membership Confirmed!</h1>
          <p>Dear ${data.name},</p>
          <p>Your ${data.membershipLevel} membership has been successfully activated.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Membership Level:</strong> ${data.membershipLevel}</p>
            <p style="margin: 8px 0;"><strong>Start Date:</strong> ${data.startDate}</p>
            <p style="margin: 8px 0;"><strong>End Date:</strong> ${data.endDate}</p>
          </div>
          <p>You now have access to all member benefits and exclusive content.</p>
        </div>
      `,
      text: `Membership Confirmed!\n\nDear ${data.name},\n\nYour ${data.membershipLevel} membership has been successfully activated.\n\nMembership Level: ${data.membershipLevel}\nStart Date: ${data.startDate}\nEnd Date: ${data.endDate}`,
    };
  }

  /**
   * Generate membership expiry reminder email template
   */
  static membershipExpiryReminder(data: {
    name: string;
    membershipLevel: string;
    expiryDate: string;
    daysRemaining: number;
    renewUrl: string;
  }): EmailTemplate {
    return {
      subject: 'Your Membership is Expiring Soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Membership Expiring Soon</h1>
          <p>Dear ${data.name},</p>
          <p>Your ${data.membershipLevel} membership will expire in ${data.daysRemaining} days on ${data.expiryDate}.</p>
          <p>Don't lose access to your exclusive member benefits!</p>
          <p>
            <a href="${data.renewUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 4px;">
              Renew Your Membership
            </a>
          </p>
        </div>
      `,
      text: `Membership Expiring Soon\n\nDear ${data.name},\n\nYour ${data.membershipLevel} membership will expire in ${data.daysRemaining} days on ${data.expiryDate}.\n\nRenew here: ${data.renewUrl}`,
    };
  }

  /**
   * Generate contact form notification email template
   */
  static contactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): EmailTemplate {
    return {
      subject: `Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Contact Form Submission</h1>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>From:</strong> ${data.name} (${data.email})</p>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
            <p style="margin: 8px 0;"><strong>Message:</strong></p>
            <p style="margin: 8px 0; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      `,
      text: `New Contact Form Submission\n\nFrom: ${data.name} (${data.email})\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
    };
  }
}
