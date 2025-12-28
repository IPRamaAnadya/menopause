/**
 * Test script for review notification emails
 * Run with: npx tsx src/features/email/test-review-email.ts
 */

import { config } from 'dotenv';

// Load environment variables from .env BEFORE any other imports
config();

import { EmailServiceFactory } from './services/email.factory';
import { getNewReviewEmailTemplate, getReviewReplyEmailTemplate, getAuthorActivityEmailTemplate } from './templates/review-notification';

async function testReviewEmails() {
  console.log('🧪 Testing Review Notification Emails...\n');

  // Create email service AFTER env vars are loaded
  const emailService = EmailServiceFactory.getDefaultService();
  
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Test 1: New Review Email
    console.log('📧 Test 1: Sending new review notification...');
    const newReviewTemplate = getNewReviewEmailTemplate({
      articleTitle: 'Managing Menopause Symptoms Naturally',
      articleSlug: 'managing-menopause-symptoms-naturally',
      reviewerName: 'Jane Smith',
      reviewContent: 'This article was incredibly helpful! The tips on natural remedies have made such a difference in my daily life. Thank you for sharing this valuable information.',
      rating: 5,
      siteUrl,
    });

    const result1 = await emailService.sendEmail({
      to: testEmail,
      from: {
        email: process.env.SMTP_FROM || 'noreply@example.com',
        name: 'Menopause Support',
      },
      subject: newReviewTemplate.subject,
      html: newReviewTemplate.html,
      text: newReviewTemplate.text,
    });

    if (result1.success) {
      console.log('✅ New review email sent successfully!');
      console.log('   Message ID:', result1.messageId);
    } else {
      console.error('❌ Failed to send new review email:', result1.error);
    }

    console.log('');

    // Test 2: Review Reply Email
    console.log('📧 Test 2: Sending review reply notification...');
    const replyTemplate = getReviewReplyEmailTemplate({
      articleTitle: 'Managing Menopause Symptoms Naturally',
      articleSlug: 'managing-menopause-symptoms-naturally',
      replierName: 'Dr. Sarah Johnson',
      replyContent: 'Thank you so much for your kind words, Jane! I\'m delighted to hear that the natural remedies have been helpful for you. If you have any questions or would like more personalized advice, feel free to reach out!',
      originalReviewContent: 'This article was incredibly helpful! The tips on natural remedies have made such a difference in my daily life.',
      recipientName: 'Jane',
      isAuthor: true,
      siteUrl,
    });

    const result2 = await emailService.sendEmail({
      to: testEmail,
      from: {
        email: process.env.SMTP_FROM || 'noreply@example.com',
        name: 'Menopause Support',
      },
      subject: replyTemplate.subject,
      html: replyTemplate.html,
      text: replyTemplate.text,
    });

    if (result2.success) {
      console.log('✅ Review reply email sent successfully!');
      console.log('   Message ID:', result2.messageId);
    } else {
      console.error('❌ Failed to send review reply email:', result2.error);
    }

    console.log('');

    // Test 3: Author Activity Notification Email
    console.log('📧 Test 3: Sending author activity notification...');
    const authorTemplate = getAuthorActivityEmailTemplate({
      articleTitle: 'Managing Menopause Symptoms Naturally',
      articleSlug: 'managing-menopause-symptoms-naturally',
      replierName: 'Emily Chen',
      replyContent: 'I completely agree with your review! I\'ve also found great success with these natural approaches. The meditation techniques mentioned in the article have been particularly helpful for managing stress.',
      originalReviewContent: 'This article was incredibly helpful! The tips on natural remedies have made such a difference in my daily life.',
      originalReviewerName: 'Jane Smith',
      authorName: 'Dr. Sarah Johnson',
      siteUrl,
    });

    const result3 = await emailService.sendEmail({
      to: testEmail,
      from: {
        email: process.env.SMTP_FROM || 'noreply@example.com',
        name: 'Hong Kong Menopause Society',
      },
      subject: authorTemplate.subject,
      html: authorTemplate.html,
      text: authorTemplate.text,
    });

    if (result3.success) {
      console.log('✅ Author activity email sent successfully!');
      console.log('   Message ID:', result3.messageId);
    } else {
      console.error('❌ Failed to send author activity email:', result3.error);
    }

    console.log('\n✨ All tests completed!');
    console.log(`📬 Check your inbox at: ${testEmail}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

// Verify connection before testing
async function main() {
  console.log('🔌 Verifying email service connection...\n');
  
  // Create email service AFTER env vars are loaded
  const emailService = EmailServiceFactory.getDefaultService();
  
  const isConnected = await emailService.verifyConnection();
  
  if (!isConnected) {
    console.error('❌ Email service connection failed!');
    console.error('Please check your email configuration in .env file');
    process.exit(1);
  }
  
  console.log('✅ Email service connected successfully!\n');
  
  await testReviewEmails();
}

main().catch(console.error);
