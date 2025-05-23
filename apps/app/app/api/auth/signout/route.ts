import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  
  // List of allowed origins for CORS
  const allowedOrigins = [
    'http://localhost:3001',   // Web app in development
    'http://localhost:3000',   // App in development (same origin, but just in case)
    'https://echoray.io',      // Production web domain
    'https://www.echoray.io',  // Production web domain with www
    'https://app.echoray.io',  // Production app domain
  ];
  
  // Determine the appropriate origin to return - ensure it's always a string
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Important for caching
  };
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    console.log('🚪 Sign out endpoint called');
    console.log('🌍 Origin:', request.headers.get('origin'));
    
    // Get the auth object
    const authObject = await auth();
    
    if (!authObject.userId) {
      console.log('⚠️ No user session to sign out');
      return NextResponse.json(
        { 
          success: true, // Still return success since the user is already signed out
          message: 'No active session found',
          debug: 'User was already signed out'
        },
        { 
          status: 200, 
          headers: corsHeaders 
        }
      );
    }

    console.log('✅ Signing out user:', authObject.userId);
    
    // Note: In Clerk, actual sign out happens on the client side
    // This endpoint confirms the intent and can be used for logging/analytics
    return NextResponse.json(
      { 
        success: true,
        message: 'Sign out initiated',
        debug: 'User sign out request processed',
        // Return the redirect URL for client-side sign out
        signOutUrl: `${request.headers.get('origin') || ''}/api/auth/signout/complete`
      },
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('🚨 Error in sign out endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        debug: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  
  console.log('🔄 OPTIONS preflight request for sign out from:', request.headers.get('origin'));
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
} 