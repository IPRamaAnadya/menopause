import { prisma } from '@/lib/prisma';
import { ArticleReview, CreateReviewDTO, UpdateReviewDTO } from '../types';
import { emailService } from '@/features/email/services/email.service';
import { getNewReviewEmailTemplate, getReviewReplyEmailTemplate, getAuthorActivityEmailTemplate } from '@/features/email/templates/review-notification';

export class ReviewService {
  /**
   * Get all reviews for an article with nested replies
   */
  static async getArticleReviews(
    articleId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: ArticleReview[]; total: number }> {
    const skip = (page - 1) * limit;

    // Get only top-level reviews (no parent_id)
    const [reviews, total] = await Promise.all([
      prisma.article_reviews.findMany({
        where: {
          article_id: articleId,
          parent_id: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
                orderBy: {
                  created_at: 'asc',
                },
              },
            },
            orderBy: {
              created_at: 'asc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.article_reviews.count({
        where: {
          article_id: articleId,
          parent_id: null,
        },
      }),
    ]);

    return {
      reviews: reviews.map((review) => this.transformReview(review)),
      total,
    };
  }

  /**
   * Get a single review by ID
   */
  static async getReviewById(id: number): Promise<ArticleReview | null> {
    const review = await prisma.article_reviews.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!review) return null;
    return this.transformReview(review);
  }

  /**
   * Create a new review or reply
   */
  static async createReview(
    data: CreateReviewDTO,
    userId: number
  ): Promise<ArticleReview> {
    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // If this is a main review (not a reply), check if user already reviewed this article
    if (!data.parent_id) {
      const existingReview = await prisma.article_reviews.findFirst({
        where: {
          article_id: data.article_id,
          user_id: userId,
          parent_id: null, // Only check for main reviews
        },
      });

      if (existingReview) {
        throw new Error('You have already reviewed this article. You can edit your existing review or reply to other reviews.');
      }
    }

    let parentReview = null;
    
    // If replying, verify parent review exists
    if (data.parent_id) {
      parentReview = await prisma.article_reviews.findUnique({
        where: { id: data.parent_id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!parentReview) {
        throw new Error('Parent review not found');
      }

      if (parentReview.article_id !== data.article_id) {
        throw new Error('Parent review does not belong to this article');
      }
    }

    // Get article details with author info
    const article = await prisma.articles.findUnique({
      where: { id: data.article_id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        article_translations: {
          where: { locale: 'en' },
          select: { title: true },
        },
      },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Get current user info
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    const review = await prisma.article_reviews.create({
      data: {
        article_id: data.article_id,
        user_id: userId,
        parent_id: data.parent_id || null,
        content: data.content,
        rating: data.rating || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Send email notifications asynchronously
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const articleTitle = article.article_translations[0]?.title || 'Untitled Article';
    
    // Track who should receive notifications (avoid duplicates)
    const notifiedEmails = new Set<string>();
    
    // If this is a reply, send notifications to relevant parties
    if (data.parent_id && parentReview) {
      // 1. Notify the person being replied to (parent review author)
      if (parentReview.user_id !== userId && parentReview.user.email) {
        notifiedEmails.add(parentReview.user.email);
        
        const reviewerTemplate = getReviewReplyEmailTemplate({
          articleTitle,
          articleSlug: article.slug,
          replierName: currentUser.name || 'Someone',
          replyContent: data.content,
          originalReviewContent: parentReview.content,
          recipientName: parentReview.user.name || 'User',
          isAuthor: userId === article.author_id,
          siteUrl,
        });

        emailService.sendEmail({
          to: parentReview.user.email,
          from: {
            email: process.env.SMTP_FROM || 'noreply@example.com',
            name: 'Hong Kong Menopause Society',
          },
          subject: reviewerTemplate.subject,
          html: reviewerTemplate.html,
          text: reviewerTemplate.text,
        }).catch((err: Error) => console.error('Failed to send email to reviewer:', err));
      }

      // 2. Notify the article author (if not already notified and not the replier)
      if (
        article.author_id !== userId && 
        article.author.email && 
        !notifiedEmails.has(article.author.email)
      ) {
        notifiedEmails.add(article.author.email);
        
        const authorTemplate = getAuthorActivityEmailTemplate({
          articleTitle,
          articleSlug: article.slug,
          replierName: currentUser.name || 'Someone',
          replyContent: data.content,
          originalReviewContent: parentReview.content,
          originalReviewerName: parentReview.user.name || 'A user',
          authorName: article.author.name || 'Author',
          siteUrl,
        });

        emailService.sendEmail({
          to: article.author.email,
          from: {
            email: process.env.SMTP_FROM || 'noreply@example.com',
            name: 'Hong Kong Menopause Society',
          },
          subject: authorTemplate.subject,
          html: authorTemplate.html,
          text: authorTemplate.text,
        }).catch((err: Error) => console.error('Failed to send email to author:', err));
      }

      // 3. For nested replies, also notify the root review author
      // Find the root review (top-level review in the thread)
      let rootReview = parentReview;
      if (parentReview.parent_id) {
        const rootReviewData = await prisma.article_reviews.findFirst({
          where: {
            id: parentReview.parent_id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        
        if (rootReviewData) {
          rootReview = rootReviewData;
        }
      }

      // Notify the root reviewer if different from parent reviewer and not already notified
      if (
        rootReview.user_id !== parentReview.user_id &&
        rootReview.user_id !== userId &&
        rootReview.user.email &&
        !notifiedEmails.has(rootReview.user.email)
      ) {
        notifiedEmails.add(rootReview.user.email);
        
        const rootReviewerTemplate = getReviewReplyEmailTemplate({
          articleTitle,
          articleSlug: article.slug,
          replierName: currentUser.name || 'Someone',
          replyContent: data.content,
          originalReviewContent: rootReview.content,
          recipientName: rootReview.user.name || 'User',
          isAuthor: userId === article.author_id,
          siteUrl,
        });

        emailService.sendEmail({
          to: rootReview.user.email,
          from: {
            email: process.env.SMTP_FROM || 'noreply@example.com',
            name: 'Hong Kong Menopause Society',
          },
          subject: rootReviewerTemplate.subject,
          html: rootReviewerTemplate.html,
          text: rootReviewerTemplate.text,
        }).catch((err: Error) => console.error('Failed to send email to root reviewer:', err));
      }
    } 
    // If this is a new review (not a reply), notify the author
    else if (!data.parent_id && article.author_id !== userId && article.author.email) {
      const template = getNewReviewEmailTemplate({
        articleTitle,
        articleSlug: article.slug,
        reviewerName: currentUser.name || 'Anonymous',
        reviewContent: data.content,
        rating: data.rating || undefined,
        siteUrl,
      });

      emailService.sendEmail({
        to: article.author.email,
        from: {
          email: process.env.SMTP_FROM || 'noreply@example.com',
          name: 'Hong Kong Menopause Society',
        },
        subject: template.subject,
        html: template.html,
        text: template.text,
      }).catch((err: Error) => console.error('Failed to send email to author:', err));
    }

    return this.transformReview(review);
  }

  /**
   * Update a review
   */
  static async updateReview(
    id: number,
    data: UpdateReviewDTO,
    userId: number
  ): Promise<ArticleReview> {
    // Check if review exists and belongs to user
    const existingReview = await prisma.article_reviews.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.user_id !== userId) {
      throw new Error('You can only edit your own reviews');
    }

    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = await prisma.article_reviews.update({
      where: { id },
      data: {
        ...(data.content && { content: data.content }),
        ...(data.rating !== undefined && { rating: data.rating }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return this.transformReview(review);
  }

  /**
   * Delete a review
   */
  static async deleteReview(id: number, userId: number): Promise<void> {
    // Check if review exists and belongs to user
    const existingReview = await prisma.article_reviews.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.user_id !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    // Delete review (cascade will handle replies)
    await prisma.article_reviews.delete({
      where: { id },
    });
  }

  /**
   * Get review statistics for an article
   */
  static async getArticleReviewStats(articleId: number) {
    const reviews = await prisma.article_reviews.findMany({
      where: {
        article_id: articleId,
        parent_id: null, // Only count top-level reviews
        rating: { not: null },
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      if (review.rating) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return {
      totalReviews,
      averageRating: Math.round(avgRating * 10) / 10,
      distribution,
    };
  }

  /**
   * Transform database review to API format
   */
  private static transformReview(review: any): ArticleReview {
    return {
      id: review.id,
      content: review.content,
      rating: review.rating,
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString(),
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image,
      },
      replies: review.replies
        ? review.replies.map((reply: any) => this.transformReview(reply))
        : undefined,
    };
  }
}
