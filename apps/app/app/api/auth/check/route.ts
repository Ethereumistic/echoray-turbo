import { currentUser } from '@clerk/nextjs/server';
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Important for caching
  };
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    console.log('🔍 Auth check endpoint called');
    console.log('🌍 Origin:', request.headers.get('origin'));
    
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return NextResponse.json(
        { 
          authenticated: false,
          user: null,
          debug: 'No user session found'
        },
        { 
          status: 200, 
          headers: corsHeaders 
        }
      );
    }

    console.log('✅ Authenticated user found:', user.id);
    
    return NextResponse.json(
      { 
        authenticated: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddresses: user.emailAddresses.map(email => ({
            emailAddress: email.emailAddress,
            id: email.id
          })),
          imageUrl: user.imageUrl,
        },
        debug: 'User session found and validated'
      },
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('🚨 Error checking auth status:', error);
    
    return NextResponse.json(
      { 
        authenticated: false,
        user: null,
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
  
  console.log('🔄 OPTIONS preflight request from:', request.headers.get('origin'));
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
} 