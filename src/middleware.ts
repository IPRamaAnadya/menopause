import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is a dashboard route
  const isDashboardRoute = pathname.includes('/dashboard');
  
  if (isDashboardRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // If not logged in, redirect to signin
    if (!token) {
      const locale = pathname.split('/')[1];
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // If not admin, redirect to main page with error
    if (token.role !== 'Administrator') {
      const locale = pathname.split('/')[1];
      const mainUrl = new URL(`/${locale}`, request.url);
      mainUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(mainUrl);
    }
  }
  
  // Run the next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
