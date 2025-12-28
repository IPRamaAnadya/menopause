# Mailtrap Email Service Setup

## Configuration

The Mailtrap email service has been configured with the following settings:

### Environment Variables (.env.local)

```env
# Mailtrap Configuration
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=640e50720de1f3
MAILTRAP_PASS=b84670b56c4f87
MAILTRAP_TOKEN=01b6bd91b3da7583a45d0cf7abcd6a0f

# Email Configuration
EMAIL_FROM=noreply@hongkongmenopause.org
EMAIL_FROM_NAME=Hong Kong Menopause Society

# Email Service Provider
EMAIL_PROVIDER=mailtrap
```

## Features

### 1. Mailtrap Email Service

- **File**: `src/features/email/services/mailtrap-email.service.ts`
- **Features**:
  - Send single emails
  - Send batch emails
  - Verify SMTP connection
  - Support for HTML and text content
  - Support for attachments, CC, BCC, reply-to
  - Full integration with nodemailer

### 2. Email Factory

- **File**: `src/features/email/services/email.factory.ts`
- **Updated** to support Mailtrap provider
- Easy switching between email providers

### 3. Test Endpoint

- **Endpoint**: `POST /api/email/test`
- **Purpose**: Send test emails to verify configuration

## Usage

### 1. Test Email Service

Send a test email via API:

```bash
# Basic test email
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'

# Welcome email template
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","type":"welcome"}'

# Password reset template
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","type":"password-reset"}'

# Membership confirmation template
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","type":"membership"}'
```

### 2. Use in Your Code

```typescript
import { EmailServiceFactory } from '@/features/email/services/email.factory';
import { EmailTemplates } from '@/features/email/templates/email-templates';

// Get email service instance
const emailService = EmailServiceFactory.getDefault();

// Send welcome email
const template = EmailTemplates.welcome({
  name: user.name,
  loginUrl: 'https://yourapp.com/login',
});

const result = await emailService.sendEmail({
  from: {
    email: 'noreply@hongkongmenopause.org',
    name: 'Hong Kong Menopause Society',
  },
  to: user.email,
  subject: template.subject,
  html: template.html,
  text: template.text,
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### 3. Available Email Templates

- **Welcome Email**: `EmailTemplates.welcome()`
- **Password Reset**: `EmailTemplates.passwordReset()`
- **Membership Confirmation**: `EmailTemplates.membershipConfirmation()`
- **Membership Expiry Reminder**: `EmailTemplates.membershipExpiryReminder()`

## Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Send a test email**:
   ```bash
   curl -X POST http://localhost:3000/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"to":"your-email@example.com"}'
   ```

3. **Check Mailtrap inbox**:
   - Go to https://mailtrap.io/
   - Login with your account
   - Check the inbox for your test email

## Next Steps

1. **Add more email templates** as needed
2. **Integrate with user registration** flow
3. **Set up password reset emails**
4. **Configure membership emails**
5. **For production**: Switch to a production email service (Mailgun, SendGrid, AWS SES)

## Production Considerations

When moving to production:

1. Change `EMAIL_PROVIDER` to your production provider
2. Update environment variables with production credentials
3. Implement proper email queue for bulk sending
4. Add email delivery tracking
5. Set up webhook handlers for email events
6. Implement bounce and complaint handling

## Troubleshooting

### Connection Issues

If emails are not sending:

1. Verify environment variables are set correctly
2. Check Mailtrap credentials
3. Test connection: The service includes `verifyConnection()` method
4. Check server logs for detailed error messages

### Rate Limiting

Mailtrap sandbox has rate limits:
- Use batch sending with delays for multiple emails
- Consider implementing a queue system for production

## Dependencies

- **nodemailer**: ^6.9.x - SMTP email client
- **@types/nodemailer**: ^6.4.x - TypeScript types
