import { NextResponse } from "next/server";

// List of all allowed origins
const allowedOrigins = [
  // Development URLs
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  
  // Production URLs
  'https://echoray.io',
  'https://app.echoray.io',
  'https://api.echoray.io',
  'https://docs.echoray.io', 
  'https://webhook.echoray.io',
  
  // Legacy URLs
  'https://echoray.dev',
  'https://echoray.com'
];

/**
 * Gets the appropriate CORS origin based on the request origin
 */
export function getCorsOrigin(originHeader: string | null): string {
  const origin = originHeader || '';
  
  // If the origin is in our allowed list, return it; otherwise use the first allowed origin
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}

/**
 * Gets the origin from a request
 */
export function getOriginFromRequest(request: Request): string | null {
  return request.headers.get('origin');
}

/**
 * Adds CORS headers to a response
 */
export function addCorsHeaders(
  response: NextResponse, 
  origin: string | null = null
): NextResponse {
  // Use the provided origin if it's allowed, otherwise use the default
  const corsOrigin = getCorsOrigin(origin);
  
  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-clerk-auth-token');
  response.headers.set('Vary', 'Origin');
  
  return response;
}

/**
 * Handles OPTIONS preflight requests
 */
export function handleOptionsRequest(request: Request): NextResponse {
  const origin = getOriginFromRequest(request);
  const corsOrigin = getCorsOrigin(origin);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-auth-token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Vary': 'Origin'
    }
  });
}

/**
 * Creates a CORS-enabled response with JSON data
 */
export function corsResponse(
  data: any, 
  options: { status?: number; origin?: string | null } = {}
): NextResponse {
  const { status = 200, origin = null } = options;
  
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, origin);
}

/**
 * Creates a CORS-enabled error response
 */
export function corsErrorResponse(
  error: string | object, 
  options: { status?: number; origin?: string | null } = {}
): NextResponse {
  const { status = 400, origin = null } = options;
  
  const errorData = typeof error === 'string' ? { error } : error;
  const response = NextResponse.json(errorData, { status });
  
  return addCorsHeaders(response, origin);
} 