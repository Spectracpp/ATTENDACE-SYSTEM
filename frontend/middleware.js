import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');

  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path
  );

  // If it's a public path and user is logged in, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If it's not a public path and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/profile/:path*',
  ],
};
