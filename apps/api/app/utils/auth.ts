import { auth as clerkAuth } from '@clerk/nextjs/server';

export async function authenticateRequest(request: Request): Promise<string | null> {
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

  return null;
} 