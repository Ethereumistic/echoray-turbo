import { database } from "@repo/database";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
  // Get the origin of the request
  const origin = request.headers.get('origin') || '*';
  
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-auth-token',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(request: Request) {
  // Get the origin of the request for CORS
  const origin = request.headers.get('origin') || '*';
  
  // Define CORS headers with credentials support
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-auth-token',
    'Access-Control-Allow-Credentials': 'true',
  };

  console.log("Received request for current user");
  console.log("Headers:", Object.fromEntries([...request.headers.entries()].map(([k, v]) => [k, k.toLowerCase().includes('auth') ? '***' : v])));
  
  try {
    // Get authenticated user from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    console.log("Auth result:", { userId: userId || 'none' });
    
    if (!userId) {
      console.error("No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    console.log("Found authenticated user:", userId);
    
    try {
      // Check if user exists in our database
      const db = database as any;
      const user = await db.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        console.log("User not found in database, will be created by webhook or signup endpoint");
        return NextResponse.json(
          { 
            userId,
            message: "User exists in Clerk but not in database yet"
          },
          { headers: corsHeaders }
        );
      }
      
      // Return user data
      return NextResponse.json(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        { headers: corsHeaders }
      );
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error: " + dbError.message },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401, headers: corsHeaders }
    );
  }
} 