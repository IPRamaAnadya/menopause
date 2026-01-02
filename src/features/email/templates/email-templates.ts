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

  /**
   * Generate email verification template
   */
  static emailVerification(data: { 
    name: string; 
    verificationUrl: string;
    locale: string;
  }): EmailTemplate {
    const isZh = data.locale.startsWith('zh');
    const primaryColor = '#E4097D';
    
    return {
      subject: isZh ? '驗證您的電郵地址' : 'Verify Your Email Address',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600;">
              ${isZh ? '香港更年期學會' : 'Hong Kong Menopause Society'}
            </h1>
          </div>
          
          <div style="background-color: ${primaryColor}; padding: 40px 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.5 13.67 12.5 13.67 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              ${isZh ? '驗證您的電郵地址' : 'Verify Your Email Address'}
            </h2>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
              ${isZh ? `您好 ${data.name}，` : `Hello ${data.name},`}
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${isZh 
                ? '感謝您註冊香港更年期學會。請點擊下面的按鈕來驗證您的電郵地址：' 
                : 'Thank you for registering with Hong Kong Menopause Society. Please click the button below to verify your email address:'}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" 
                 style="display: inline-block; padding: 16px 32px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${isZh ? '驗證電郵地址' : 'Verify Email Address'}
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              ${isZh 
                ? '如果按鈕無法點擊，請複製並貼上以下連結到您的瀏覽器：' 
                : 'If the button doesn\'t work, copy and paste this link into your browser:'}
            </p>
            <p style="color: ${primaryColor}; font-size: 14px; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${data.verificationUrl}
            </p>
          </div>

          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
              <strong>${isZh ? '⏰ 重要提示：' : '⏰ Important:'}</strong>
              ${isZh 
                ? '此驗證連結將在 24 小時後過期。' 
                : 'This verification link will expire in 24 hours.'}
            </p>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
              ${isZh 
                ? '如果您沒有註冊此帳戶，請忽略此電郵。' 
                : 'If you didn\'t create an account, please ignore this email.'}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} ${isZh ? '香港更年期學會' : 'Hong Kong Menopause Society'}. ${isZh ? '版權所有。' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      `,
      text: isZh 
        ? `驗證您的電郵地址\n\n您好 ${data.name}，\n\n感謝您註冊香港更年期學會。請點擊以下連結來驗證您的電郵地址：\n\n${data.verificationUrl}\n\n此連結將在 24 小時後過期。\n\n如果您沒有註冊此帳戶，請忽略此電郵。`
        : `Verify Your Email Address\n\nHello ${data.name},\n\nThank you for registering with Hong Kong Menopause Society. Please click the link below to verify your email address:\n\n${data.verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
    };
  }
}

