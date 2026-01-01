import { EmailTemplate } from '../types/email.types';

/**
 * Event-related email template generator functions
 */
export class EventEmailTemplates {
  /**
   * Generate event registration confirmation email
   */
  static registrationConfirmation(data: {
    name: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    meetingUrl?: string;
  }): EmailTemplate {
    const locationInfo = data.meetingUrl
      ? `<p><strong>Join Online:</strong> <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>`
      : `<p><strong>Location:</strong> ${data.eventLocation}</p>`;

    return {
      subject: `Event Registration Confirmed: ${data.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Registration Confirmed!</h1>
          <p>Dear ${data.name},</p>
          <p>Your registration for the following event has been confirmed:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0066cc; margin-top: 0;">${data.eventTitle}</h2>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${data.eventTime}</p>
            ${locationInfo}
          </div>

          <p>We look forward to seeing you at the event!</p>
          
          ${data.meetingUrl ? '<p><em>Note: You will also receive the meeting link closer to the event date.</em></p>' : ''}
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      `,
      text: `Registration Confirmed!\n\nDear ${data.name},\n\nYour registration for the following event has been confirmed:\n\n${data.eventTitle}\nDate: ${data.eventDate}\nTime: ${data.eventTime}\n${data.meetingUrl ? `Join Online: ${data.meetingUrl}` : `Location: ${data.eventLocation}`}\n\nWe look forward to seeing you at the event!`,
    };
  }

  /**
   * Generate event reminder email
   */
  static eventReminder(data: {
    name: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    meetingUrl?: string;
    hoursUntilEvent: number;
  }): EmailTemplate {
    const locationInfo = data.meetingUrl
      ? `<p><strong>Join Online:</strong> <a href="${data.meetingUrl}" style="color: #0066cc; font-weight: bold;">${data.meetingUrl}</a></p>`
      : `<p><strong>Location:</strong> ${data.eventLocation}</p>`;

    return {
      subject: `Reminder: ${data.eventTitle} starts in ${data.hoursUntilEvent} hours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Event Reminder</h1>
          <p>Dear ${data.name},</p>
          <p>This is a friendly reminder that your registered event is starting soon!</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h2 style="color: #dc2626; margin-top: 0;">${data.eventTitle}</h2>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${data.eventTime}</p>
            ${locationInfo}
            <p style="margin: 8px 0; font-size: 18px; color: #dc2626;">
              <strong>Starts in ${data.hoursUntilEvent} hours</strong>
            </p>
          </div>

          ${data.meetingUrl ? '<p style="background-color: #dcfce7; padding: 12px; border-radius: 4px;">💻 <strong>Online Event:</strong> Click the link above to join when it\'s time!</p>' : ''}
          
          <p>We're looking forward to seeing you there!</p>
        </div>
      `,
      text: `Event Reminder\n\nDear ${data.name},\n\nThis is a friendly reminder that your registered event is starting soon!\n\n${data.eventTitle}\nDate: ${data.eventDate}\nTime: ${data.eventTime}\n${data.meetingUrl ? `Join Online: ${data.meetingUrl}` : `Location: ${data.eventLocation}`}\n\nStarts in ${data.hoursUntilEvent} hours\n\nWe're looking forward to seeing you there!`,
    };
  }

  /**
   * Generate event cancellation email
   */
  static eventCancellation(data: {
    name: string;
    eventTitle: string;
    eventDate: string;
    reason?: string;
  }): EmailTemplate {
    return {
      subject: `Event Cancelled: ${data.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Event Cancelled</h1>
          <p>Dear ${data.name},</p>
          <p>We regret to inform you that the following event has been cancelled:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${data.eventTitle}</h2>
            <p style="margin: 8px 0;"><strong>Scheduled Date:</strong> ${data.eventDate}</p>
            ${data.reason ? `<p style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
          </div>

          <p>If you paid for this event, you will receive a full refund within 5-7 business days.</p>
          <p>We apologize for any inconvenience this may cause.</p>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, please contact us.
          </p>
        </div>
      `,
      text: `Event Cancelled\n\nDear ${data.name},\n\nWe regret to inform you that the following event has been cancelled:\n\n${data.eventTitle}\nScheduled Date: ${data.eventDate}\n${data.reason ? `Reason: ${data.reason}\n` : ''}\nIf you paid for this event, you will receive a full refund within 5-7 business days.\n\nWe apologize for any inconvenience this may cause.`,
    };
  }

  /**
   * Generate event update notification email
   */
  static eventUpdate(data: {
    name: string;
    eventTitle: string;
    eventDate: string;
    changes: string;
  }): EmailTemplate {
    return {
      subject: `Event Update: ${data.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0066cc;">Event Update</h1>
          <p>Dear ${data.name},</p>
          <p>There has been an update to your registered event:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${data.eventTitle}</h2>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
          </div>

          <div style="background-color: #dbeafe; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What's Changed:</strong></p>
            <p style="margin: 8px 0 0 0;">${data.changes}</p>
          </div>

          <p>Please make note of these changes. We look forward to seeing you at the event!</p>
        </div>
      `,
      text: `Event Update\n\nDear ${data.name},\n\nThere has been an update to your registered event:\n\n${data.eventTitle}\nDate: ${data.eventDate}\n\nWhat's Changed:\n${data.changes}\n\nPlease make note of these changes. We look forward to seeing you at the event!`,
    };
  }

  /**
   * Generate payment pending reminder email
   */
  static paymentPendingReminder(data: {
    name: string;
    eventTitle: string;
    eventDate: string;
    paymentUrl: string;
    expiryHours: number;
  }): EmailTemplate {
    return {
      subject: `Complete Your Registration: ${data.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Complete Your Registration</h1>
          <p>Dear ${data.name},</p>
          <p>You started registering for the following event, but haven't completed your payment:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${data.eventTitle}</h2>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
          </div>

          <p>Complete your registration before it expires:</p>
          
          <p style="text-align: center;">
            <a href="${data.paymentUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Complete Payment
            </a>
          </p>

          <p style="color: #dc2626; font-size: 14px;">
            ⏰ This registration will expire in ${data.expiryHours} hours
          </p>
        </div>
      `,
      text: `Complete Your Registration\n\nDear ${data.name},\n\nYou started registering for the following event, but haven't completed your payment:\n\n${data.eventTitle}\nDate: ${data.eventDate}\n\nComplete your payment here: ${data.paymentUrl}\n\n⏰ This registration will expire in ${data.expiryHours} hours`,
    };
  }
}
