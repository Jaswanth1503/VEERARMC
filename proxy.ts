import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth/session';

const rolePrefixMappings: Record<string, string> = {
  'Admin': '/dashboard/admin',
  'Customer': '/dashboard/customer',
  'Contractor': '/dashboard/contractor',
  'Employee': '/dashboard/employee',
  'Supplier': '/dashboard/supplier',
};

const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  if (isDashboardRoute) {
    const session = await getSession();
    
    // 1. Unauthenticated users -> Redirect to Login
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const userRole = session.role;
    const allowedPrefix = rolePrefixMappings[userRole];

    // 2. Base /dashboard route -> Redirect to role-specific portal
    if (pathname === '/dashboard') {
      if (allowedPrefix) {
        return NextResponse.redirect(new URL(allowedPrefix, request.url));
      } else {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    // 3. Prevent cross-role access (e.g. Customer accessing /dashboard/admin)
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
