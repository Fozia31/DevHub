import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log(`🔒 Middleware Check - Path: ${pathname} | Cookie Token: ${!!token}`);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = 
    pathname.startsWith('/student') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard');

  // 1. If no token and trying to access protected route
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      // Decode JWT
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      
      const { role } = JSON.parse(jsonPayload);
      const userRole = role?.toLowerCase(); // Case-insensitivity fix

      // 2. Prevent Auth Page access when logged in
      if (isAuthPage) {
        const dest = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
      }

      // 3. Role-Based Access Control (RBAC)
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }
      
      if (pathname.startsWith('/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    } catch (error) {
      console.error("❌ JWT Decode Error:", error);
      // Only delete and redirect if we aren't already heading to login
      if (!isAuthPage) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Use a negative lookahead to exclude static files/api, making it cleaner
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};