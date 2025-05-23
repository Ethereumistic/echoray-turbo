import { getAuth, currentUser } from '@clerk/nextjs/server';
import { database } from '@repo/database';
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
    
    // Try to get the user ID and details in different ways
    let userId = null;
    let authEmail = null;
    let authName = null;
    
    try {
      // First attempt: Use currentUser() function to get full user details
      const user = await currentUser();
      if (user?.id) {
        userId = user.id;
        authEmail = user.primaryEmailAddress?.emailAddress;
        authName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || '';
        console.log("currentUser result:", { 
          userId: userId || 'none',
          email: authEmail || 'none',
          name: authName || 'none'
        });
      }
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
    
    // Use auth data if available, otherwise fall back to request data
    const email = authEmail || userData.email;
    const name = authName || userData.name || '';
    
    console.log('User signup/verification request:', {
      userId,
      email: email || 'not provided',
      name: name || 'not provided'
    });
    
    // Validate that we have at least an email
    if (!email) {
      return corsResponse({
        success: false,
        error: 'Email is required for user creation',
        userId
      }, { status: 400, origin });
    }
    
    try {
      // Check if the user exists in our database
      const existingUser = await database.user.findUnique({
        where: { id: userId }
      });
      
      if (existingUser) {
        console.log("User already exists in database:", userId);
        
        // Check if user information needs updating
        const needsUpdate = existingUser.email !== email || existingUser.name !== name;
        
        if (needsUpdate) {
          console.log("Updating user information:", { 
            currentEmail: existingUser.email, 
            newEmail: email,
            currentName: existingUser.name,
            newName: name
          });
          
          const updatedUser = await database.user.update({
            where: { id: userId },
            data: {
              email,
              name
            }
          });
          
          console.log("User information updated successfully:", updatedUser.id);
          
          return corsResponse({
            success: true,
            message: 'User information updated successfully',
            userId: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name
          }, { origin });
        } else {
          console.log("User information is up to date");
          
          return corsResponse({
            success: true,
            message: 'User verified successfully',
            userId: existingUser.id,
            email: existingUser.email,
            name: existingUser.name
          }, { origin });
        }
      }
      
      // Create new user in database
      console.log("Creating new user in database:", { userId, email, name });
      
      const newUser = await database.user.create({
        data: {
          id: userId,
          email,
          name: name || null // Prisma expects null for optional fields, not empty strings
        }
      });
      
      console.log("User created successfully in database:", newUser.id);
      
      return corsResponse({
        success: true,
        message: 'User created successfully',
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name
      }, { origin });
      
    } catch (dbError: any) {
      console.error("Database error during user creation/verification:", dbError);
      
      // Handle unique constraint violations (likely email or id conflict)
      if (dbError.code === 'P2002') {
        console.log("Unique constraint violation - checking which field caused the conflict");
        
        // Check if it's an email conflict
        if (dbError.meta?.target?.includes('email')) {
          console.log("Email conflict detected - user might exist with different ID");
          
          try {
            // Find user by email to see if they exist with a different ID
            const userByEmail = await database.user.findUnique({
              where: { email }
            });
            
            if (userByEmail && userByEmail.id !== userId) {
              return corsResponse({
                success: false,
                error: 'Email already exists with a different user ID',
                conflictingUserId: userByEmail.id,
                requestedUserId: userId
              }, { status: 409, origin });
            }
          } catch (lookupError) {
            console.error("Error looking up user by email:", lookupError);
          }
        }
        
        // For other unique constraint violations, try with a modified email
        try {
          const timestamp = Date.now();
          const modifiedEmail = `${email.split('@')[0]}-${timestamp}@${email.split('@')[1]}`;
          
          console.log("Attempting to create user with modified email:", modifiedEmail);
          
          const newUser = await database.user.create({
            data: {
              id: userId,
              email: modifiedEmail,
              name: name || null
            }
          });
          
          console.log("User created with modified email:", newUser.id);
          
          return corsResponse({
            success: true,
            message: 'User created with modified email due to conflict',
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            originalEmail: email
          }, { origin });
          
        } catch (retryError: any) {
          console.error("Failed to create user with modified email:", retryError);
          
          return corsResponse({
            success: false,
            error: 'Failed to create user record due to database constraints',
            details: retryError.message
          }, { status: 500, origin });
        }
      }
      
      // Handle other database errors
      return corsResponse({
        success: false,
        error: 'Database error during user operation',
        details: dbError.message,
        code: dbError.code
      }, { status: 500, origin });
    }
    
  } catch (error: any) {
    console.error('User signup/verification error:', error);
    return corsResponse({
      success: false,
      error: 'Failed to process user signup/verification',
      errorDetails: error instanceof Error ? error.message : String(error),
      isAuthenticated: false
    }, { status: 500, origin: getOriginFromRequest(request) });
  }
} 