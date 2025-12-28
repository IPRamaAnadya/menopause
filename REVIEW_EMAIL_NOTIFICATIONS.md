# Review Email Notifications

This document explains the email notification system for article reviews.

## Features

The system automatically sends email notifications in the following scenarios:

### 1. New Review on Article
When someone posts a review on an article, the article author receives an email notification containing:
- Reviewer's name
- Rating (if provided)
- Review content
- Direct link to view the review

### 2. Reply to Review
When someone replies to a review, notifications are sent to:
- **Original Reviewer**: Gets notified about the reply (unless they're replying to themselves)
- **Article Author**: Gets notified about the conversation (unless they're the replier or original reviewer)

Each notification includes:
- Replier's name and role (author or community member)
- Reply content
- Original review content for context
- Direct link to view the conversation

## Email Templates

The email templates are located in:
```
src/features/email/templates/review-notification.ts
```

Two main templates are available:
1. `getNewReviewEmailTemplate()` - For new reviews
2. `getReviewReplyEmailTemplate()` - For review replies

Both templates include:
- Professional HTML design with gradient headers
- Responsive layout for mobile devices
- Plain text fallback for email clients that don't support HTML
- Clear call-to-action buttons

## Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Mailtrap API Configuration (for development/testing)
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_TEST_INBOX_ID=your_test_inbox_id

# Email From Address
SMTP_FROM=noreply@yoursite.com

# Site URL (used in email links)
NEXT_PUBLIC_SITE_URL=https://yoursite.com

# Test Email (for testing purposes)
TEST_EMAIL=your-email@example.com
```

### Getting Mailtrap Credentials

1. Sign up at [Mailtrap.io](https://mailtrap.io)
2. Go to Email Testing → Inboxes
3. Select your inbox
4. Go to API tab
5. Copy your API Token and Inbox ID

## Testing Email Notifications

### Manual Test Script

Run the test script to verify email templates:

```bash
npx tsx src/features/email/test-review-email.ts
```

This will send test emails for:
- New review notification
- Review reply notification

### Testing in Development

1. Create a test article in your development database
2. Post a review on the article as a different user
3. Check the Mailtrap inbox for the email
4. Reply to the review
5. Check for reply notification emails

## Implementation Details

### Review Service Integration

The email notifications are integrated into the `ReviewService.createReview()` method in:
```
src/features/reviews/services/review.service.ts
```

The service:
1. Creates the review/reply in the database
2. Fetches necessary information (article, author, users)
3. Sends appropriate email notifications asynchronously
4. Continues even if email sending fails (logged as error)

### Error Handling

Email sending happens asynchronously and doesn't block review creation. If an email fails to send:
- The error is logged to console
- The review/reply is still saved successfully
- Users can continue using the application

### Email Content Sanitization

Review content is rendered as-is in the emails. For production, consider:
- HTML escaping user content to prevent XSS
- Truncating very long reviews
- Filtering inappropriate content

## Production Considerations

### Switching from Mailtrap to Production SMTP

For production, you may want to use a different email service:

1. **Amazon SES**
2. **SendGrid**
3. **Mailgun**
4. **Postmark**

Update the email service configuration accordingly in:
```
src/features/email/services/email.service.ts
```

### Rate Limiting

The review endpoints already have rate limiting configured in:
```
src/lib/rate-limit.ts
```

This helps prevent email spam from malicious users.

### Email Preferences

Consider adding user preferences for:
- Opting out of review notifications
- Choosing notification frequency (immediate, daily digest, etc.)
- Selecting which types of notifications to receive

## Customization

### Styling Email Templates

Edit the CSS in the email templates to match your brand:
- Colors: Update gradient colors and primary colors
- Fonts: Modify font-family properties
- Layout: Adjust padding, margins, and widths

### Email Content

Customize the email copy in:
- Subject lines
- Greeting messages
- Call-to-action text
- Footer content

### Adding New Notification Types

To add new notification types:

1. Create new template function in `review-notification.ts`
2. Call the template in the appropriate service method
3. Send email using `emailService.sendEmail()`

## Troubleshooting

### Emails Not Sending

Check:
- Environment variables are set correctly
- Mailtrap API token is valid
- Email service connection is successful
- Console logs for error messages

### Emails Going to Spam

For production emails:
- Configure SPF, DKIM, and DMARC records
- Use a verified domain for sending
- Include unsubscribe links
- Maintain good sender reputation

### Template Not Rendering Correctly

- Test in multiple email clients
- Use inline CSS for better compatibility
- Provide plain text alternative
- Keep HTML simple and table-based for layouts

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify environment configuration
3. Test email service connection
4. Review Mailtrap inbox for test emails
