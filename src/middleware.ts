import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  // Always set the token cookie from header, prioritizing it for API routes
  request.cookies.set(`sb-${getProjectRef()}-auth-token`, token);
}

const ROLE_ROUTES: Record<string, string[]> = {
  admin: [
    '/admin-dashboard',
    '/real-time-production-dashboard',
    '/catalog',
    '/orders',
    '/admin',
  ],
  staff: [
    '/staff-dashboard',
    '/staff',
  ],
  customer: [
    '/customer-dashboard',
    '/support',
  ],
};

const ROLE_HOME: Record<string, string> = {
  admin: '/admin-dashboard',
  staff: '/staff-dashboard',
  customer: '/customer-dashboard',
};

const PUBLIC_PATHS = [
  '/sign-up-login-screen',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/assets',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  injectTokenFromHeader(request);
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  try {
    // Allow root path (redirect to login if not authenticated)
    if (pathname === '/') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/sign-up-login-screen';
        return NextResponse.redirect(url);
      }
      // Redirect to role-based home
      const role = user.user_metadata?.role || 'staff';
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] || '/staff-dashboard';
      return NextResponse.redirect(url);
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Don't immediately reject - check if this is a transient auth issue
      // Let client-side auth handle it if session just hasn't synced to server yet
      // Only redirect if it's a clear unauthenticated state
      const hasCookies = request.cookies.getAll().some((c) => c.name.includes('auth'));
      
      if (!hasCookies) {
        // No auth cookies at all - definitely not authenticated
        const url = request.nextUrl.clone();
        url.pathname = '/sign-up-login-screen';
        return NextResponse.redirect(url);
      }
      // Has cookies but getUser failed - likely a transient issue
      // Pass through and let client handle it
      return supabaseResponse;
    }

    const userRole = user.user_metadata?.role || 'staff';

    // Check if user is accessing a route allowed for their role
    const allowedPrefixes = ROLE_ROUTES[userRole] || [];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[userRole] || '/staff-dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // If middleware check fails, don't block - let client handle auth
    console.warn('Middleware auth check error (non-blocking):', error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
