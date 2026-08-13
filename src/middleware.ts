import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.includes('/admin')) {
    if (!session) {
      // Redirect to login if no session
      const locale = req.cookies.get('NEXT_LOCALE')?.value || 'ur';
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  // Protect /student routes
  if (pathname.includes('/student')) {
    if (!session) {
      const locale = req.cookies.get('NEXT_LOCALE')?.value || 'ur';
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/', 
    '/(ur|ar|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)' 
  ]
};
