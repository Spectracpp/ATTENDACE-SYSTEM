import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token');
  const role = request.cookies.get('role');

  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login/user',
    '/auth/login/admin',
    '/auth/signup/user',
    '/auth/signup/admin',
  ];

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's a public path and user is logged in, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL(
      role === 'admin' ? '/admin/dashboard' : '/dashboard',
      request.url
    ));
  }

  // If it's not a public path and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/login/user', request.url));
  }

  // If it's an admin route but user is not an admin, redirect to user dashboard
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/profile/:path*',
  ],
};
