/**
 * Email address with optional name
 */
export interface EmailAddress {
  email: string;
  name?: string;
}

/**
 * Email attachment structure
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Base email options for sending emails
 */
export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[] | string | string[];
  from: EmailAddress | string;
  subject: string;
  html?: string;
  text?: string;
  cc?: EmailAddress | EmailAddress[] | string | string[];
  bcc?: EmailAddress | EmailAddress[] | string | string[];
  replyTo?: EmailAddress | string;
  attachments?: EmailAttachment[];
  tags?: string[];
}

/**
 * Result of email send operation
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email template data structure
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Common email template types
 */
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  MEMBERSHIP_CONFIRMATION = 'membership-confirmation',
  MEMBERSHIP_EXPIRY_REMINDER = 'membership-expiry-reminder',
  CONTACT_FORM = 'contact-form',
  NEWSLETTER = 'newsletter',
}
