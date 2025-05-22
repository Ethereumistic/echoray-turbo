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

// POST endpoint to verify or create a user
export async function POST(request: Request) {
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
    
    // Parse the JSON request body
    const userData = await request.json();
    
    // Check if the request includes a userId and we don't have one from auth
    if (!userId && userData.userId) {
      console.log("Using userId from request body:", userData.userId);
      userId = userData.userId;
    }
    
    if (!userId) {
      return corsResponse({
        success: false,
        error: 'Authentication required',
        isAuthenticated: false
      }, { status: 401, origin });
    }
    
    console.log('User signup/verification:', {
      userId,
      email: userData.email || 'not provided',
      name: userData.name || 'not provided'
    });
    
    // Here you would normally:
    // 1. Check if the user exists in your database
    // 2. Create the user if they don't exist
    // 3. Update user information if needed
    
    // For this example, we'll just return a success response
    return corsResponse({
      success: true,
      message: 'User verified/created successfully',
      userId: userId
    }, { origin });
  } catch (error) {
    console.error('User signup/verification error:', error);
    return corsResponse({
      success: false,
      error: 'Failed to process user signup/verification',
      errorDetails: error instanceof Error ? error.message : String(error),
      isAuthenticated: false
    }, { status: 500, origin: getOriginFromRequest(request) });
  }
} 