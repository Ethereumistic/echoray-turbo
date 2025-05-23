import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a matcher for public routes (routes that don't require authentication)
const isPublicRoute = createRouteMatcher([
  // API routes that should be public
  '/api/auth/check',   // Allow our auth check endpoint to be accessed publicly
  '/api/auth/signout', // Allow sign out endpoint to be accessed publicly
  
  // Clerk authentication pages - MUST be public to prevent redirect loops
  '/sign-in(.*)',      // All sign-in routes and sub-routes
  '/sign-up(.*)',      // All sign-up routes and sub-routes
  '/signout',          // Our custom sign out page
  '/auth-callback',    // Auth callback page - MUST be public to prevent redirect loops
  
  // Clerk API routes - MUST be public for Clerk to function
  '/api/webhooks/clerk', // Clerk webhooks if you have them
  
  // Any Clerk internal routes
  '/api/clerk(.*)',    // Clerk internal API routes
  
  // Add any other public pages you might have
  // '/about', '/contact', etc.
]);

export default clerkMiddleware(async (auth, req) => {
  // Log all requests for debugging (but less verbose to avoid spam)
  const url = new URL(req.url);
  console.log(`🚦 ${req.method} ${url.pathname}`);
  
  // If this is a public route, don't require authentication
  if (isPublicRoute(req)) {
    console.log('✅ Public route accessed');
    return;
  }
  
  // For all other routes, require authentication
  console.log('🔒 Protected route - requiring auth');
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
