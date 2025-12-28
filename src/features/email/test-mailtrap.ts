import { MailtrapEmailService } from './services/mailtrap-email.service';
import { config } from 'dotenv';

// Load environment variables from .env
config();

// Simple test script to verify Mailtrap configuration
async function testMailtrap() {
  console.log('🧪 Testing Mailtrap Email Service...\n');

  const emailService = new MailtrapEmailService();

  // Test 1: Verify connection
  console.log('1️⃣ Testing connection...');
  const isConnected = await emailService.verifyConnection();
  console.log(`   Connection: ${isConnected ? '✅ Success' : '❌ Failed'}\n`);

  if (!isConnected) {
    console.error('❌ Connection failed. Please check your environment variables.');
    process.exit(1);
  }

  // Test 2: Send a test email
  console.log('2️⃣ Sending test email...');
  const result = await emailService.sendEmail({
    from: {
      email: 'noreply@hongkongmenopause.org',
      name: 'Hong Kong Menopause Society',
    },
    to: 'test@example.com',
    subject: 'Test Email from Mailtrap Integration',
    html: `
      <!doctype html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body style="font-family: sans-serif;">
          <div style="display: block; margin: auto; max-width: 600px;">
            <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">
              Congrats! Mailtrap Integration Works! 🎉
            </h1>
            <p>If you are viewing this email in Mailtrap – the integration is working perfectly.</p>
            <p>Your email service is now ready to send emails from your Next.js application!</p>
            <p>Good luck with your project! 🚀</p>
          </div>
        </body>
      </html>
    `,
    text: 'Congrats! Mailtrap Integration Works!\n\nIf you are viewing this email in Mailtrap – the integration is working perfectly.\n\nYour email service is now ready to send emails from your Next.js application!\n\nGood luck with your project!',
  });

  if (result.success) {
    console.log(`   ✅ Email sent successfully!`);
    console.log(`   📧 Message ID: ${result.messageId}\n`);
    console.log('🎉 All tests passed!');
    console.log('📬 Check your Mailtrap inbox at: https://mailtrap.io/\n');
  } else {
    console.error(`   ❌ Failed to send email: ${result.error}\n`);
    process.exit(1);
  }
}

testMailtrap().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
