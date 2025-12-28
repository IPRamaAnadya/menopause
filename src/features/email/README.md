# Email Feature

A modular email service with interface-based architecture that makes it easy to swap email providers.

## Architecture

The email feature follows the **Strategy Pattern** and **Dependency Inversion Principle**:

- **Interface (`IEmailService`)**: Defines the contract that all email services must implement
- **Implementations**: Specific email provider implementations (e.g., Mailgun, SendGrid, AWS SES)
- **Factory**: Creates and manages email service instances
- **Templates**: Pre-built email templates for common use cases

## Current Implementation

Currently configured to use **Mailgun** as the email provider (API integration pending).

## Structure

```
src/features/email/
├── interfaces/
│   └── IEmailService.ts          # Email service interface
├── services/
│   ├── mailgun-email.service.ts  # Mailgun implementation
│   └── email.factory.ts          # Service factory
├── templates/
│   └── email-templates.ts        # Pre-built email templates
├── types/
│   └── email.types.ts            # TypeScript types
├── index.ts                      # Main exports
└── README.md                     # This file
```

## Usage

### Basic Email Sending

```typescript
import { EmailServiceFactory } from '@/features/email';

const emailService = EmailServiceFactory.getDefaultService();

await emailService.sendEmail({
  to: 'user@example.com',
  from: 'noreply@menopause.org',
  subject: 'Hello!',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',
});
```

### Using Pre-built Templates

```typescript
import { EmailServiceFactory, EmailTemplates } from '@/features/email';

const emailService = EmailServiceFactory.getDefaultService();
const template = EmailTemplates.welcome({
  name: 'John Doe',
  loginUrl: 'https://menopause.org/login',
});

await emailService.sendEmail({
  to: 'john@example.com',
  from: 'noreply@menopause.org',
  subject: template.subject,
  html: template.html,
  text: template.text,
});
```

### Batch Email Sending

```typescript
const emails = [
  {
    to: 'user1@example.com',
    from: 'noreply@menopause.org',
    subject: 'Newsletter',
    html: '<h1>Newsletter</h1>',
  },
  {
    to: 'user2@example.com',
    from: 'noreply@menopause.org',
    subject: 'Newsletter',
    html: '<h1>Newsletter</h1>',
  },
];

const results = await emailService.sendBatchEmails(emails);
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Service Provider (mailgun, sendgrid, aws-ses)
EMAIL_PROVIDER=mailgun

# Mailgun Configuration
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_API_URL=https://api.mailgun.net/v3
```

## Adding a New Email Provider

To add a new email provider (e.g., SendGrid):

1. **Create the service class**:

```typescript
// src/features/email/services/sendgrid-email.service.ts
import { IEmailService } from '../interfaces/IEmailService';
import { SendEmailOptions, EmailSendResult } from '../types/email.types';

export class SendGridEmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    // Implement SendGrid logic here
  }

  async sendBatchEmails(emails: SendEmailOptions[]): Promise<EmailSendResult[]> {
    // Implement batch sending
  }

  async verifyConnection(): Promise<boolean> {
    // Verify SendGrid connection
  }

  getProviderName(): string {
    return 'sendgrid';
  }
}
```

2. **Register in the factory**:

```typescript
// In email.factory.ts
import { SendGridEmailService } from './sendgrid-email.service';

export enum EmailProvider {
  MAILGUN = 'mailgun',
  SENDGRID = 'sendgrid', // Add here
}

// In the create() method switch statement:
case EmailProvider.SENDGRID:
  return new SendGridEmailService();
```

3. **Update environment variables**:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
```

That's it! The entire application will now use SendGrid without any code changes elsewhere.

## Available Templates

The following email templates are pre-built:

- **Welcome Email**: Sent to new users after registration
- **Password Reset**: Password reset link email
- **Membership Confirmation**: Membership activation confirmation
- **Membership Expiry Reminder**: Reminder before membership expires
- **Contact Form**: Internal notification of contact form submissions

## API Endpoints (Future)

You can create API endpoints to send emails:

```typescript
// app/api/email/send/route.ts
import { EmailServiceFactory } from '@/features/email';

export async function POST(req: Request) {
  const emailService = EmailServiceFactory.getDefaultService();
  const { to, subject, html } = await req.json();

  const result = await emailService.sendEmail({
    to,
    from: 'noreply@menopause.org',
    subject,
    html,
  });

  return Response.json(result);
}
```

## Testing

The current implementation logs to console instead of making actual API calls. This allows for testing the integration without hitting actual email services.

To enable actual email sending, implement the Mailgun API calls in `mailgun-email.service.ts`.

## Benefits

- ✅ **Easy to swap providers**: Change one environment variable
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Testable**: Mock the interface for testing
- ✅ **Consistent API**: Same methods regardless of provider
- ✅ **Pre-built templates**: Ready-to-use email templates
- ✅ **Batch support**: Send multiple emails efficiently
