import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedApiResponse, ApiErrorCode } from '@/types/api';

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
): NextResponse<PaginatedApiResponse<T>> {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  code: ApiErrorCode | string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Unauthorized access') =>
    errorResponse(ApiErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Insufficient permissions') =>
    errorResponse(ApiErrorCode.FORBIDDEN, message, 403),
  
  notFound: (resource = 'Resource') =>
    errorResponse(ApiErrorCode.NOT_FOUND, `${resource} not found`, 404),
  
  validation: (details: any, message = 'Validation failed') =>
    errorResponse(ApiErrorCode.VALIDATION_ERROR, message, 422, details),
  
  internal: (message = 'Internal server error') =>
    errorResponse(ApiErrorCode.INTERNAL_ERROR, message, 500),
  
  alreadyExists: (resource = 'Resource') =>
    errorResponse(ApiErrorCode.ALREADY_EXISTS, `${resource} already exists`, 409),
  
  invalidInput: (message = 'Invalid input') =>
    errorResponse(ApiErrorCode.INVALID_INPUT, message, 400),
  
  badRequest: (message = 'Bad request') =>
    errorResponse(ApiErrorCode.INVALID_INPUT, message, 400),
  
  rateLimit: (message = 'Too many requests', retryAfter?: number) => {
    const response = errorResponse(ApiErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
    if (retryAfter) {
      response.headers.set('Retry-After', Math.ceil(retryAfter / 1000).toString());
    }
    return response;
  },
};
