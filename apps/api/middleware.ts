import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

// This creates a matcher for public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/survey",
  "/users/signup",
  "/users/current",
  "/auth/check",
  "/threat-monitor/my-ip" // Allow getting user's IP without authentication
]);

// Check if a route should be public in development
const isDevPublicRoute = (pathname: string) => {
  if (process.env.NODE_ENV === 'development') {
    // In development, allow all threat-monitor endpoints to bypass Clerk middleware
    // since we handle authentication manually in the endpoints
    if (pathname.startsWith('/threat-monitor/')) {
      return true;
    }
  }
  return false;
};

// Helper function to get appropriate CORS origin
function getCorsOrigin(request: any) {
  const origin = request.headers.get('origin') || '';
  
  // List of allowed origins
  const allowedOrigins = [
    // Development URLs
    'http://localhost:3000',
    'http://localhost:3001',
    
    // Production URLs
    'https://echoray.io',
    'https://app.echoray.io',
    'https://api.echoray.io',
    'https://docs.echoray.io', 
    'https://webhook.echoray.io',
    
    // Legacy URLs
    'https://echoray.dev',
    'https://echoray.com'
  ];
  
  // If the origin is allowed, use it; otherwise use the first allowed origin
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}

// Use clerkMiddleware instead of authMiddleware as per Clerk docs
export default clerkMiddleware((auth, req: any) => {
  // Handle OPTIONS requests
  if (req && req.method === 'OPTIONS') {
    const corsOrigin = getCorsOrigin(req);
    
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-auth-token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // 24 hours
        'Vary': 'Origin'
      }
    });
  }
  
  // For public routes, allow access
  if (isPublicRoute(req) || isDevPublicRoute(req?.nextUrl?.pathname || '')) {
    const response = NextResponse.next();
    
    // Add CORS headers
    const corsOrigin = getCorsOrigin(req);
    response.headers.set('Access-Control-Allow-Origin', corsOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
    
    return response;
  }
  
  // For protected routes
  return auth.protect()
    .then(() => {
      const response = NextResponse.next();
      
      // Add CORS headers
      const corsOrigin = getCorsOrigin(req);
      response.headers.set('Access-Control-Allow-Origin', corsOrigin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
      
      return response;
    })
    .catch(() => {
      // Auth failed
      const corsOrigin = getCorsOrigin(req);
      
      return NextResponse.json(
        { error: "Authentication required" },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin'
          }
        }
      );
    });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 