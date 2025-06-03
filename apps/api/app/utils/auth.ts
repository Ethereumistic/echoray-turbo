import { auth as clerkAuth } from '@clerk/nextjs/server';

export async function authenticateRequest(request: Request): Promise<string | null> {
  // In development mode, allow localhost requests to bypass auth for easier testing
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    
    console.log('Auth debug - URL hostname:', url.hostname);
    console.log('Auth debug - Origin:', origin);
    console.log('Auth debug - NODE_ENV:', process.env.NODE_ENV);
    
    // Allow requests from localhost:3000 (app) to localhost:3002 (api)
    if (
      origin?.includes('localhost:3000') || 
      origin?.includes('localhost') ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1'
    ) {
      console.log('Auth debug - Allowing development request');
      // Return a dummy user ID for development
      return 'dev-user-123';
    }
  }

  // Try Clerk authentication first (for same-domain requests)
  try {
    const { userId } = await clerkAuth();
    if (userId) {
      return userId;
    }
  } catch (error) {
    // Clerk auth failed, continue to token-based auth
  }

  // Try Bearer token authentication (for cross-domain requests)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Decode JWT payload (in production, you should verify the signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Return the user ID from the token (Clerk uses 'sub' field)
      return payload.sub || null;
    } catch (error) {
      console.error('Invalid token format:', error);
      return null;
    }
  }

  console.log('Auth debug - No authentication found, denying request');
  return null;
} 