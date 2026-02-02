// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect internal pages
  if (!token && (pathname.startsWith('/student') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based redirection if token exists
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userRole = decodedPayload.role;

      // Prevent role-crossing
      if (pathname.startsWith('/student') && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname.startsWith('/admin') && userRole === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // Redirect away from login if already authenticated
      if (pathname === '/login') {
        const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    } catch (error) {
      // If token is invalid, clear it
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// FIXED MATCHER: Ensure every string starts with /
export const config = {
  matcher: [
    '/student/:path*', 
    '/admin/:path*', 
    '/login', 
    '/register' // Fixed: was likely missing a slash or had a typo here
  ],
};