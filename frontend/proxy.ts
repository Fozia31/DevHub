// frontend/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NEXT.js 16 Fix: Export a function named 'proxy'
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (!token && (pathname.startsWith('/student') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
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