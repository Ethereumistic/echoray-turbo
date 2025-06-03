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
    
    // Get the client's real IP address first
    const clientIP = getRealIP(request);
    console.log('Detected client IP:', clientIP);
    
    // Get comprehensive IP info from IPInfo API for the CLIENT's IP
    const ipInfoToken = process.env.IPINFO_API_TOKEN;
    let ipInfoUrl = `https://ipinfo.io/${clientIP}/json`;
    
    if (ipInfoToken) {
      ipInfoUrl += `?token=${ipInfoToken}`;
    }

    console.log('Calling IPInfo for client IP:', ipInfoUrl);

    const ipInfoResponse = await fetch(ipInfoUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EchoRay-ThreatMonitor/1.0'
      }
    });

    if (!ipInfoResponse.ok) {
      throw new Error(`IPInfo API error: ${ipInfoResponse.status}`);
    }

    const ipData = await ipInfoResponse.json();
    console.log('IPInfo response for client:', ipData);

    // Fallback to detected client IP if IPInfo doesn't return an IP
    const actualIP = ipData.ip || clientIP;

    // Parse coordinates if available
    let coordinates = null;
    if (ipData.loc) {
      const [lat, lon] = ipData.loc.split(',');
      coordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }

    // Structure the response with comprehensive IP information
    const response = {
      ip: actualIP,
      ipType: actualIP?.includes(':') ? 'IPv6' : 'IPv4',
      
      // Geolocation
      geolocation: {
        city: ipData.city,
        region: ipData.region,
        country: ipData.country,
        countryName: ipData.country, // IPInfo returns country code, we might want full name
        postal: ipData.postal,
        timezone: ipData.timezone,
        coordinates: coordinates
      },
      
      // Network/ISP Information
      network: {
        asn: ipData.org?.split(' ')[0], // Extract ASN from org string
        asnName: ipData.org?.substring(ipData.org.indexOf(' ') + 1), // ASN name
        isp: ipData.org,
        hostname: ipData.hostname,
        // Note: Some fields like range, abuse contact require paid plans
      },
      
      // Additional Info
      privacy: {
        isHosting: ipData.org?.toLowerCase().includes('hosting') || 
                   ipData.org?.toLowerCase().includes('cloud') ||
                   ipData.org?.toLowerCase().includes('server'),
        // VPN/Proxy detection requires paid plans
      },
      
      timestamp: new Date().toISOString(),
      source: 'IPInfo.io',
      note: ipInfoToken ? 'Using authenticated IPInfo API' : 'Using free IPInfo API (limited data)',
      debug: {
        detectedClientIP: clientIP,
        requestHeaders: {
          'x-forwarded-for': request.headers.get('x-forwarded-for'),
          'x-real-ip': request.headers.get('x-real-ip'),
          'cf-connecting-ip': request.headers.get('cf-connecting-ip')
        }
      }
    };

    return createSuccessResponse(response, origin);
  } catch (error: any) {
    console.error('My IP endpoint error:', error);
    
    // Fallback to basic client IP if IPInfo fails
    const fallbackIP = getRealIP(request);
    return createSuccessResponse(
      {
        ip: fallbackIP,
        ipType: fallbackIP?.includes(':') ? 'IPv6' : 'IPv4',
        error: 'Failed to get comprehensive IP data',
        message: 'Please check your IPInfo API configuration',
        timestamp: new Date().toISOString(),
        fallback: true
      },
      origin
    );
  }
} 