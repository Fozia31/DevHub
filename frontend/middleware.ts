import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect internal pages: If no token, go to login
  if (!token && (pathname.startsWith('/student') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      // EDGE-SAFE DECODING: Replaces Buffer.from
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decodedPayload = JSON.parse(jsonPayload);
      const userRole = decodedPayload.role;

      // 2. Role Protection: Redirect if trying to access the wrong dashboard
      if (pathname.startsWith('/student') && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname.startsWith('/admin') && userRole === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // 3. Authenticated Redirect: Prevent viewing login/register when logged in
      if (pathname === '/login' || pathname === '/register') {
        const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    } catch (error) {
      // If decoding fails, clear the invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*', 
    '/admin/:path*', 
    '/login', 
    '/register'
  ],
};