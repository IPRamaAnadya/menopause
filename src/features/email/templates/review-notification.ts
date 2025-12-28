/**
 * Email template for notifying article author about a new review
 */
export function getNewReviewEmailTemplate(data: {
  articleTitle: string;
  articleSlug: string;
  reviewerName: string;
  reviewContent: string;
  rating?: number;
  siteUrl: string;
}) {
  const { articleTitle, articleSlug, reviewerName, reviewContent, rating, siteUrl } = data;
  
  const ratingHearts = rating ? '❤️'.repeat(rating) + '🤍'.repeat(5 - rating) : '';
  const articleUrl = `${siteUrl}/articles/${articleSlug}`;

  return {
    subject: `New Review on "${articleTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f8f8f8;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background-color: #E4097D;
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            .content {
              padding: 40px 32px;
            }
            .greeting {
              font-size: 16px;
              color: #1a1a1a;
              margin-bottom: 24px;
            }
            .article-info {
              background-color: #f8f8f8;
              padding: 16px 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .article-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .article-title {
              font-size: 18px;
              color: #1a1a1a;
              font-weight: 600;
              line-height: 1.4;
            }
            .review-card {
              border: 1px solid #e5e5e5;
              border-radius: 10px;
              padding: 24px;
              margin: 24px 0;
              background-color: #fafafa;
            }
            .reviewer-info {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e5e5e5;
            }
            .reviewer-name {
              font-size: 15px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .rating {
              display: inline-block;
              font-size: 18px;
              color: #E4097D;
              letter-spacing: 2px;
              margin-top: 4px;
            }
            .review-text {
              font-size: 15px;
              color: #4a4a4a;
              line-height: 1.7;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #E4097D;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              letter-spacing: -0.01em;
            }
            .footer {
              background-color: #f8f8f8;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e5e5e5;
            }
            .footer-text {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }
            .footer-link {
              color: #E4097D;
              text-decoration: none;
              font-weight: 500;
            }
            .divider {
              height: 1px;
              background-color: #e5e5e5;
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>New Review Received</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello,</p>
              <p class="greeting">You have received a new review on your article.</p>
              
              <div class="article-info">
                <div class="article-label">Article</div>
                <div class="article-title">${articleTitle}</div>
              </div>
              
              <div class="review-card">
                <div class="reviewer-info">
                  <div>
                    <div class="reviewer-name">${reviewerName}</div>
                    ${rating ? `<div class="rating">${ratingHearts}</div>` : ''}
                  </div>
                </div>
                <div class="review-text">${reviewContent}</div>
              </div>
              
              <div class="cta-section">
                <a href="${articleUrl}#reviews" class="button">View & Respond</a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                The Hong Kong Menopause Society<br>
                <a href="${siteUrl}" class="footer-link">Visit Website</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Review Received!

Your article "${articleTitle}" has received a new review.

Reviewer: ${reviewerName}
${rating ? `Rating: ${rating}/5` : ''}

Review:
${reviewContent}

View the review: ${articleUrl}#reviews

This is an automated notification from your article review system.
    `.trim(),
  };
}

/**
 * Email template for notifying about a reply to a review
 */
export function getReviewReplyEmailTemplate(data: {
  articleTitle: string;
  articleSlug: string;
  replierName: string;
  replyContent: string;
  originalReviewContent: string;
  recipientName: string;
  isAuthor: boolean;
  siteUrl: string;
}) {
  const { articleTitle, articleSlug, replierName, replyContent, originalReviewContent, recipientName, isAuthor, siteUrl } = data;
  
  const articleUrl = `${siteUrl}/articles/${articleSlug}`;
  const roleLabel = isAuthor ? 'Article Author' : 'Community Member';

  return {
    subject: `New Reply on "${articleTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f8f8f8;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background-color: #E4097D;
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            .content {
              padding: 40px 32px;
            }
            .greeting {
              font-size: 16px;
              color: #1a1a1a;
              margin-bottom: 16px;
            }
            .article-info {
              background-color: #f8f8f8;
              padding: 16px 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .article-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .article-title {
              font-size: 18px;
              color: #1a1a1a;
              font-weight: 600;
              line-height: 1.4;
            }
            .reply-card {
              border: 2px solid #E4097D;
              border-radius: 10px;
              padding: 24px;
              margin: 24px 0;
              background-color: #fff;
            }
            .reply-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e5e5e5;
            }
            .replier-name {
              font-size: 15px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .role-badge {
              display: inline-block;
              background-color: #E4097D;
              color: #fff;
              font-size: 11px;
              font-weight: 600;
              padding: 4px 10px;
              border-radius: 12px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }
            .reply-text {
              font-size: 15px;
              color: #1a1a1a;
              line-height: 1.7;
            }
            .original-review {
              background-color: #fafafa;
              border-left: 3px solid #e5e5e5;
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            .original-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              margin-bottom: 12px;
            }
            .original-text {
              font-size: 14px;
              color: #4a4a4a;
              line-height: 1.7;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #E4097D;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              letter-spacing: -0.01em;
            }
            .footer {
              background-color: #f8f8f8;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e5e5e5;
            }
            .footer-text {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }
            .footer-link {
              color: #E4097D;
              text-decoration: none;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>New Reply to Your Review</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${recipientName},</p>
              <p class="greeting"><strong>${replierName}</strong> has replied to your review.</p>
              
              <div class="article-info">
                <div class="article-label">Article</div>
                <div class="article-title">${articleTitle}</div>
              </div>
              
              <div class="reply-card">
                <div class="reply-header">
                  <div class="replier-name">${replierName}</div>
                  <span class="role-badge">${roleLabel}</span>
                </div>
                <div class="reply-text">${replyContent}</div>
              </div>
              
              <div class="original-review">
                <div class="original-label">Your Review</div>
                <div class="original-text">${originalReviewContent}</div>
              </div>
              
              <div class="cta-section">
                <a href="${articleUrl}#reviews" class="button">View Conversation</a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                The Hong Kong Menopause Society<br>
                <a href="${siteUrl}" class="footer-link">Visit Website</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Reply to Your Review

Hello ${recipientName},

${replierName} replied to your review on "${articleTitle}".

Reply:
${replyContent}

Your Original Review:
${originalReviewContent}

View the conversation: ${articleUrl}#reviews

This is an automated notification from your article review system.
    `.trim(),
  };
}

/**
 * Email template for notifying article author about activity on their article
 */
export function getAuthorActivityEmailTemplate(data: {
  articleTitle: string;
  articleSlug: string;
  replierName: string;
  replyContent: string;
  originalReviewContent: string;
  originalReviewerName: string;
  authorName: string;
  siteUrl: string;
}) {
  const { articleTitle, articleSlug, replierName, replyContent, originalReviewContent, originalReviewerName, authorName, siteUrl } = data;
  
  const articleUrl = `${siteUrl}/articles/${articleSlug}`;

  return {
    subject: `New Activity on Your Article: "${articleTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f8f8f8;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              background-color: #E4097D;
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            .content {
              padding: 40px 32px;
            }
            .greeting {
              font-size: 16px;
              color: #1a1a1a;
              margin-bottom: 16px;
            }
            .highlight {
              color: #E4097D;
              font-weight: 600;
            }
            .article-info {
              background-color: #f8f8f8;
              padding: 16px 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .article-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .article-title {
              font-size: 18px;
              color: #1a1a1a;
              font-weight: 600;
              line-height: 1.4;
            }
            .activity-card {
              border: 2px solid #E4097D;
              border-radius: 10px;
              padding: 24px;
              margin: 24px 0;
              background-color: #fff;
            }
            .activity-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e5e5e5;
            }
            .user-name {
              font-size: 15px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .activity-badge {
              display: inline-block;
              background-color: #E4097D;
              color: #fff;
              font-size: 11px;
              font-weight: 600;
              padding: 4px 10px;
              border-radius: 12px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }
            .activity-text {
              font-size: 15px;
              color: #1a1a1a;
              line-height: 1.7;
            }
            .context-section {
              background-color: #fafafa;
              border-left: 3px solid #e5e5e5;
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            .context-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .context-meta {
              font-size: 13px;
              color: #666;
              margin-bottom: 12px;
            }
            .context-text {
              font-size: 14px;
              color: #4a4a4a;
              line-height: 1.7;
            }
            .info-box {
              background-color: #FFF4F8;
              border-left: 3px solid #E4097D;
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 6px;
            }
            .info-text {
              font-size: 14px;
              color: #4a4a4a;
              line-height: 1.6;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #E4097D;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              letter-spacing: -0.01em;
            }
            .footer {
              background-color: #f8f8f8;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e5e5e5;
            }
            .footer-text {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }
            .footer-link {
              color: #E4097D;
              text-decoration: none;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <h1>New Activity on Your Article</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${authorName},</p>
              <p class="greeting">There's new activity on your article. <span class="highlight">${replierName}</span> replied to a review.</p>
              
              <div class="article-info">
                <div class="article-label">Your Article</div>
                <div class="article-title">${articleTitle}</div>
              </div>
              
              <div class="activity-card">
                <div class="activity-header">
                  <div class="user-name">${replierName}</div>
                  <span class="activity-badge">New Reply</span>
                </div>
                <div class="activity-text">${replyContent}</div>
              </div>
              
              <div class="context-section">
                <div class="context-label">Replying To</div>
                <div class="context-meta">Review by ${originalReviewerName}</div>
                <div class="context-text">${originalReviewContent}</div>
              </div>
              
              <div class="info-box">
                <p class="info-text">
                  💡 As the article author, you're kept informed of all discussions. Consider joining the conversation to engage with your readers!
                </p>
              </div>
              
              <div class="cta-section">
                <a href="${articleUrl}#reviews" class="button">View Discussion</a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                The Hong Kong Menopause Society<br>
                <a href="${siteUrl}" class="footer-link">Visit Website</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Activity on Your Article

Hello ${authorName},

There's new activity on your article "${articleTitle}".

${replierName} replied to a review:
${replyContent}

Original Review by ${originalReviewerName}:
${originalReviewContent}

As the article author, you're kept informed of all discussions. Consider joining the conversation to engage with your readers!

View the discussion: ${articleUrl}#reviews

---
The Hong Kong Menopause Society
    `.trim(),
  };
}
