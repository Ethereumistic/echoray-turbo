import { NextResponse } from 'next/server';
import { handleOptionsRequest, getOriginFromRequest } from '../../utils/cors';
import { createSuccessResponse, createErrorResponse } from '../utils';

export const runtime = 'edge';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleOptionsRequest(request);
}

export async function GET(request: Request): Promise<NextResponse> {
  const origin = getOriginFromRequest(request);

  try {
    console.log('My IP endpoint called - Origin:', origin);
    
    // Get comprehensive IP info from IPInfo API
    const ipInfoToken = process.env.IPINFO_API_TOKEN;
    let ipInfoUrl = 'https://ipinfo.io/json';
    
    if (ipInfoToken) {
      ipInfoUrl += `?token=${ipInfoToken}`;
    }

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
    console.log('IPInfo response:', ipData);

    // Parse coordinates if available
    let coordinates = null;
    if (ipData.loc) {
      const [lat, lon] = ipData.loc.split(',');
      coordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }

    // Structure the response with comprehensive IP information
    const response = {
      ip: ipData.ip,
      ipType: ipData.ip?.includes(':') ? 'IPv6' : 'IPv4',
      
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
      note: ipInfoToken ? 'Using authenticated IPInfo API' : 'Using free IPInfo API (limited data)'
    };

    return createSuccessResponse(response, origin);
  } catch (error: any) {
    console.error('My IP endpoint error:', error);
    
    // Fallback to basic response if IPInfo fails
    return createSuccessResponse(
      {
        ip: '127.0.0.1',
        ipType: 'IPv4',
        error: 'Failed to get comprehensive IP data',
        message: 'Please check your IPInfo API configuration',
        timestamp: new Date().toISOString()
      },
      origin
    );
  }
} 