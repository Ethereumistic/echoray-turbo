import { clerkMiddleware } from '@clerk/nextjs/server';
import arcjet, { detectBot } from '@repo/security';
import { NextResponse } from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
};

const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
    // Block all bots except search engine crawlers and preview link
    // generators. See the full list of bots for other options:
    // https://docs.arcjet.com/bot-protection/identifying-bots
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
  })
);

export default clerkMiddleware(async (_auth, request) => {
  // Fix for TypeScript error in Next.js 15
  const decision = await aj.protect(request as any);

  if (
    // If this deny comes from a bot rule then block the request. You can
    // customize this logic to fit your needs e.g. changing the status code.
    decision.isDenied() &&
    decision.reason.isBot()
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.next();
});
