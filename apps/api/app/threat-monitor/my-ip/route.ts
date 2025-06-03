import { NextResponse } from 'next/server';
import { handleOptionsRequest, getOriginFromRequest } from '../../utils/cors';
import { getRealIP, createSuccessResponse, createErrorResponse } from '../utils';

export const runtime = 'edge';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleOptionsRequest(request);
}

export async function GET(request: Request): Promise<NextResponse> {
  const origin = getOriginFromRequest(request);

  try {
    console.log('My IP endpoint called - Origin:', origin);
    
    // Get the user's real IP address
    const userIP = getRealIP(request);
    
    console.log('My IP endpoint - User IP:', userIP);

    // Determine IP type and provide helpful info
    let ipType = 'unknown';
    let isLocalhost = false;
    let displayMessage = '';

    if (userIP === '::1') {
      ipType = 'IPv6';
      isLocalhost = true;
      displayMessage = 'IPv6 localhost (::1)';
    } else if (userIP === '127.0.0.1') {
      ipType = 'IPv4';
      isLocalhost = true;
      displayMessage = 'IPv4 localhost (127.0.0.1)';
    } else if (userIP.includes(':')) {
      ipType = 'IPv6';
      displayMessage = 'IPv6 address';
    } else if (userIP.includes('.')) {
      ipType = 'IPv4';
      displayMessage = 'IPv4 address';
    }

    return createSuccessResponse(
      {
        ip: userIP,
        ipType,
        isLocalhost,
        displayMessage,
        timestamp: new Date().toISOString(),
        note: isLocalhost ? 'This is your local development IP. Your public IP would be different.' : 'This is your detected IP address.'
      },
      origin
    );
  } catch (error: any) {
    console.error('My IP endpoint error:', error);
    return createErrorResponse(
      'Failed to determine IP address',
      500,
      origin
    );
  }
} 