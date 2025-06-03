import { NextResponse } from 'next/server';
import { handleOptionsRequest, getOriginFromRequest } from '../../utils/cors';
import { authenticateRequest } from '../../utils/auth';
import {
  checkRateLimit,
  AbuseIPDBClient,
  getIPGeolocation,
  createSuccessResponse,
  createErrorResponse
} from '../utils';

export const runtime = 'edge';

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return handleOptionsRequest(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  const origin = getOriginFromRequest(request);

  try {
    // Authenticate user
    const userId = await authenticateRequest(request);
    if (!userId) {
      return createErrorResponse('Authentication required', 401, origin);
    }

    // Check rate limit (once per day)
    const rateLimitResult = await checkRateLimit(userId, 'ip-reputation');
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Rate limit exceeded: You can only check IP reputation once per day',
        429,
        origin
      );
    }

    // Parse request body
    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return createErrorResponse('IP address is required', 400, origin);
    }

    // Validate IP format (basic validation)
    let targetIP = ip.trim();
    
    // Handle localhost addresses in development
    if (process.env.NODE_ENV === 'development') {
      if (targetIP === '::1' || targetIP === '127.0.0.1' || targetIP === 'localhost') {
        // For development, use a public IP for testing (Google's DNS)
        targetIP = '8.8.8.8';
        console.log(`Development mode: Converting localhost IP ${ip} to ${targetIP} for testing`);
      }
    }
    
    // Basic IP validation (IPv4 format)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(targetIP)) {
      return createErrorResponse('Invalid IP address format', 400, origin);
    }

    // Initialize API clients
    let abuseIPDBClient: AbuseIPDBClient;
    try {
      abuseIPDBClient = new AbuseIPDBClient();
    } catch (error) {
      console.error('AbuseIPDB client initialization failed:', error);
      return createErrorResponse('Service temporarily unavailable', 503, origin);
    }

    // Perform parallel API calls
    const [abuseIPDBResult, geoResult] = await Promise.allSettled([
      abuseIPDBClient.checkIP(targetIP),
      getIPGeolocation(targetIP)
    ]);

    // Process AbuseIPDB result
    let abuseData = null;
    if (abuseIPDBResult.status === 'fulfilled') {
      abuseData = abuseIPDBResult.value.data;
    } else {
      console.error('AbuseIPDB API error:', abuseIPDBResult.reason);
    }

    // Process geolocation result
    let geoData = null;
    if (geoResult.status === 'fulfilled') {
      geoData = geoResult.value;
    } else {
      console.error('Geolocation API error:', geoResult.reason);
    }

    // Calculate risk score based on available data
    let riskScore = 0;
    let isSafe = true;
    let threatType: string | undefined = undefined;
    const threats: string[] = [];

    if (abuseData) {
      riskScore = abuseData.abuseConfidencePercentage || 0;
      
      if (abuseData.isBlacklisted) {
        threats.push('Blacklisted');
        threatType = 'Blacklisted IP';
        isSafe = false;
      }

      if (abuseData.usageType === 'malware') {
        threats.push('Malware');
        threatType = 'Malware Distribution';
        isSafe = false;
      }

      if (riskScore > 25) {
        isSafe = false;
      }
    }

    // Build response
    const response = {
      ip: ip.trim(),
      isSafe,
      riskScore,
      country: geoData?.country || 'Unknown',
      isp: geoData?.isp || 'Unknown',
      threatType,
      blacklisted: abuseData?.isBlacklisted || false,
      abuseConfidence: abuseData?.abuseConfidencePercentage || 0,
      details: {
        lastReported: abuseData?.lastReportedAt,
        totalReports: abuseData?.totalReports || 0,
        countryCode: abuseData?.countryCode || geoData?.countryCode,
        usageType: abuseData?.usageType,
        proxy: geoData?.proxy || false,
        hosting: geoData?.hosting || false,
        actualIPChecked: targetIP !== ip.trim() ? targetIP : undefined
      }
    };

    return createSuccessResponse(response, origin);
  } catch (error: any) {
    console.error('IP reputation check error:', error);
    return createErrorResponse(
      'Failed to check IP reputation',
      500,
      origin
    );
  }
} 