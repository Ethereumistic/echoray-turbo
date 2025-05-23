import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a matcher for public routes (routes that don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/api/auth/check',   // Allow our auth check endpoint to be accessed publicly
  '/api/auth/signout', // Allow sign out endpoint to be accessed publicly
  '/signout',          // Allow sign out page to be accessed publicly
]);

export default clerkMiddleware(async (auth, req) => {
  // Log all requests for debugging
  console.log(`🚦 Middleware: ${req.method} ${req.url}`);
  
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
