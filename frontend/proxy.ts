// frontend/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If NO token and trying to access internal pages -> Send to Login
  if (!token && (pathname.startsWith('/student') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If token EXISTS, handle smart redirection
  if (token) {
    try {
      // Decode the JWT payload without a library
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userRole = decodedPayload.role;

      // Prevent Admins from seeing Student pages and vice-versa
      if (pathname.startsWith('/student') && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname.startsWith('/admin') && userRole === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // If they go to /login while already logged in, send them to their correct home
      if (pathname === '/login') {
        const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    } catch (error) {
      // If token is malformed, clear it and send to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/login', '/register'],
};