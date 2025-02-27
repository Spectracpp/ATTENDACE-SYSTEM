import { NextResponse } from 'next/server';

export function middleware(request) {
  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login/user',
    '/auth/login/admin',
    '/auth/admin/login',
    '/auth/register',
    '/auth/register/admin',
    '/auth/register/user',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/check',
  ];

  // Admin-only paths
  const adminPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/analytics',
    '/admin/organization',
    '/admin/notifications',
    '/admin/settings',
  ];

  // User-only paths
  const userPaths = [
    '/user',
    '/user/dashboard',
    '/user/attendance',
    '/user/leaves',
    '/user/profile',
  ];

  const currentPath = request.nextUrl.pathname;

  // Skip middleware for public paths, static files, and API routes
  if (
    publicPaths.some(path => currentPath.startsWith(path)) ||
    currentPath.startsWith('/_next') ||
    currentPath.startsWith('/api/auth') ||
    currentPath.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Get auth cookies
  const token = request.cookies.get('token');
  const role = request.cookies.get('role');

  // Handle /dashboard redirect
  if (currentPath === '/dashboard') {
    if (role?.value === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (role?.value === 'user') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login/user', request.url));
    }
  }

  // If no token, redirect to appropriate login page
  if (!token?.value) {
    // For admin paths, redirect to admin login
    if (adminPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/login/admin', request.url));
    }
    // For user paths or other protected paths, redirect to user login
    if (userPaths.some(path => currentPath.startsWith(path))) {
      return NextResponse.redirect(new URL('/auth/login/user', request.url));
    }
    // For any other protected path
    return NextResponse.redirect(new URL('/auth/login/user', request.url));
  }

  // Check role-based access for admin paths
  if (adminPaths.some(path => currentPath.startsWith(path)) && role?.value !== 'admin') {
    console.log('Middleware - Unauthorized admin access attempt:', {
      path: currentPath,
      userRole: role?.value
    });
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  // Check role-based access for user paths
  if (userPaths.some(path => currentPath.startsWith(path)) && role?.value !== 'user') {
    console.log('Middleware - Unauthorized user access attempt:', {
      path: currentPath,
      userRole: role?.value
    });
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // If trying to access root path with auth, redirect to role-specific dashboard
  if (currentPath === '/') {
    if (role?.value === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else if (role?.value === 'user') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
};
