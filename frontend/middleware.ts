import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Extract token - check multiple sources
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // DEBUG LOG
  console.log(`🔒 Middleware Check - Path: ${pathname} | Cookie Token: ${!!token}`);

  // 2. Public paths - allow access
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = pathname.startsWith('/student') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  // 3. If no token and trying to access protected route
  if (!token && isProtectedRoute) {
    console.log("➡️ No token found, redirecting to login");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      // Decode JWT to get user role
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { role } = JSON.parse(jsonPayload);
      console.log(`👤 User Role: ${role}`);

      // 4. Prevent Role Crossing
      if (pathname.startsWith('/student') && role !== 'student') {
        console.log(`🚫 Role mismatch - Admin trying to access student area, redirecting to admin dashboard`);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      
      if (pathname.startsWith('/admin') && role !== 'admin') {
        console.log(`🚫 Role mismatch - Student trying to access admin area, redirecting to student dashboard`);
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // 5. If logged in, don't stay on login/register
      if (isAuthPage) {
        const dest = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        console.log(`✅ Already logged in, redirecting to ${dest}`);
        return NextResponse.redirect(new URL(dest, request.url));
      }
    } catch (error) {
      console.error("❌ JWT Decode Error:", error);
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 6. Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/student/:path*', 
    '/admin/:path*', 
    '/dashboard/:path*',
    '/login', 
    '/register'
  ],
};