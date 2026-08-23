import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth/session';

const rolePrefixMappings: Record<string, string> = {
  'Admin': '/dashboard/admin',
  'Super Admin': '/dashboard/admin',
  'Customer': '/dashboard/customer',
  'Contractor': '/dashboard/contractor',
  'Employee': '/dashboard/employee',
  'Supplier': '/dashboard/supplier',
};

const sharedDashboardRoutes = [
  '/dashboard/analytics',
  '/dashboard/executive',
  '/dashboard/logistics',
  '/dashboard/plant',
  '/dashboard/settings',
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  if (isDashboardRoute) {
    const session = await getSession();
    
    // 1. Unauthenticated users -> Redirect to Login
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const userRole = session.role || 'Customer';
    const allowedPrefix = rolePrefixMappings[userRole] || '/dashboard/customer';

    // 2. Base /dashboard route -> Redirect to role-specific portal
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }

    // 3. Admin & Super Admin have unrestricted access to all dashboard routes
    if (userRole === 'Admin' || userRole === 'Super Admin') {
      return NextResponse.next();
    }

    // 4. Shared cross-functional executive & operations routes
    if (sharedDashboardRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // 5. Prevent unauthorized cross-role access (e.g. Customer accessing /dashboard/admin)
    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
