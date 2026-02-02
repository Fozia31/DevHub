import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Extract token - check both cookie and Authorization header as fallback
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // DEBUG LOG - View this in Vercel Dashboard > Logs
  console.log(`Path: ${pathname} | Token Present: ${!!token}`);

  // 2. Public paths - allow access
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = pathname.startsWith('/student') || pathname.startsWith('/admin');

  if (!token && isProtectedRoute) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      // Decode JWT for Edge Runtime
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { role } = JSON.parse(jsonPayload);

      // 3. Prevent Role Crossing
      if (pathname.startsWith('/student') && role !== 'student') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // 4. If logged in, don't stay on login/register
      if (isAuthPage) {
        const dest = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    } catch (error) {
      console.error("JWT Decode Error:", error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/','/student/:path*', '/admin/:path*', '/login', '/register'],
};