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
    
    try {
      // First attempt: Use currentUser() function
      const user = await currentUser();
      userId = user?.id;
      console.log("currentUser result:", { userId: userId || 'none' });
    } catch (authError) {
      console.error("Error with currentUser():", authError);
    }
    
    // Second attempt: Try getAuth if currentUser() failed
    if (!userId) {
      try {
        const authResult = getAuth(request);
        userId = authResult?.userId;
        console.log("getAuth result:", { userId: userId || 'none' });
      } catch (userError) {
        console.error("Error with getAuth():", userError);
      }
    }
    
    // Third attempt: Try to extract from request headers
    if (!userId) {
      try {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // You would need to verify this token with Clerk
          // This is just to show the approach
          console.log("Found authorization header");
        }
      } catch (headerError) {
        console.error("Error checking headers:", headerError);
      }
    }
    
    // If we have a user ID, return success
    if (userId) {
      return corsResponse({
        isAuthenticated: true,
        userId: userId
      }, { origin });
    }
    
    // No user ID found, return not authenticated
    return corsResponse({
      isAuthenticated: false,
      userId: null,
      message: "User not authenticated"
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