import { getAuth, currentUser } from '@clerk/nextjs/server';
import { 
  corsResponse, 
  corsErrorResponse, 
  handleOptionsRequest, 
  getOriginFromRequest 
} from '../../utils/cors';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

// GET endpoint to check authentication status
export async function GET(request: Request) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Try to get the user ID in different ways
    let userId = null;
    let authMethod = 'none';
    
    try {
      // First attempt: Use currentUser() function (works when cookies are accessible)
      const user = await currentUser();
      if (user?.id) {
        userId = user.id;
        authMethod = 'currentUser';
        console.log("currentUser result:", { userId, authMethod });
      }
    } catch (authError) {
      console.error("Error with currentUser():", authError);
    }
    
    // Second attempt: Try getAuth if currentUser() failed
    if (!userId) {
      try {
        const authResult = getAuth(request);
        if (authResult?.userId) {
          userId = authResult.userId;
          authMethod = 'getAuth';
          console.log("getAuth result:", { userId, authMethod });
        }
      } catch (userError) {
        console.error("Error with getAuth():", userError);
      }
    }
    
    // Log information about any session tokens provided
    if (!userId) {
      try {
        const authHeader = request.headers.get('authorization');
        const sessionToken = request.headers.get('x-clerk-session-token');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          console.log("Found Bearer token in Authorization header (but couldn't verify due to cross-domain issue)");
          authMethod = 'bearer-token-provided';
        } else if (sessionToken) {
          console.log("Found session token in x-clerk-session-token header (but couldn't verify due to cross-domain issue)");
          authMethod = 'session-token-provided';
        }
      } catch (headerError) {
        console.error("Error checking headers:", headerError);
      }
    }
    
    // If we have a user ID, return success
    if (userId) {
      return corsResponse({
        isAuthenticated: true,
        userId: userId,
        authMethod
      }, { origin });
    }
    
    // No user ID found, return not authenticated
    return corsResponse({
      isAuthenticated: false,
      userId: null,
      message: "User not authenticated",
      authMethod
    }, { origin });
  } catch (error) {
    console.error('Authentication check error:', error);
    // Return a proper 200 response with error info instead of 500
    return corsResponse({
      isAuthenticated: false,
      userId: null,
      error: 'Failed to check authentication status',
      errorDetails: error instanceof Error ? error.message : String(error)
    }, { origin: getOriginFromRequest(request) });
  }
} 