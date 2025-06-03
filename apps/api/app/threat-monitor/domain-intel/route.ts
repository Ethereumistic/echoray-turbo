import { NextResponse } from 'next/server';
import { handleOptionsRequest, getOriginFromRequest } from '../../utils/cors';
import { authenticateRequest } from '../../utils/auth';
import {
  checkRateLimit,
  SecurityTrailsClient,
  performDNSLookup,
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
    const rateLimitResult = await checkRateLimit(userId, 'domain-intel');
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Rate limit exceeded: You can only analyze domains once per day',
        429,
        origin
      );
    }

    // Parse request body
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return createErrorResponse('Domain is required', 400, origin);
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,})$/;
    if (!domainRegex.test(domain)) {
      return createErrorResponse('Invalid domain format', 400, origin);
    }

    // Initialize SecurityTrails client
    let securityTrailsClient: SecurityTrailsClient;
    try {
      securityTrailsClient = new SecurityTrailsClient();
    } catch (error) {
      console.error('SecurityTrails client initialization failed:', error);
      return createErrorResponse('Service temporarily unavailable', 503, origin);
    }

    // Perform parallel API calls
    const [domainDetailsResult, domainHistoryResult, dnsResult, whoisResult] = await Promise.allSettled([
      securityTrailsClient.getDomainDetails(domain),
      securityTrailsClient.getDomainHistory(domain),
      performDNSLookup(domain),
      performWHOISLookup(domain)
    ]);

    // Process SecurityTrails domain details
    let domainDetails = null;
    if (domainDetailsResult.status === 'fulfilled') {
      domainDetails = domainDetailsResult.value;
    } else {
      console.error('SecurityTrails domain details error:', domainDetailsResult.reason);
    }

    // Process SecurityTrails domain history
    let domainHistory = null;
    if (domainHistoryResult.status === 'fulfilled') {
      domainHistory = domainHistoryResult.value;
    } else {
      console.error('SecurityTrails domain history error:', domainHistoryResult.reason);
    }

    // Process DNS results
    let dnsData = null;
    if (dnsResult.status === 'fulfilled') {
      dnsData = dnsResult.value;
    } else {
      console.error('DNS lookup error:', dnsResult.reason);
    }

    // Process WHOIS results
    let whoisData = null;
    if (whoisResult.status === 'fulfilled') {
      whoisData = whoisResult.value;
    } else {
      console.error('WHOIS lookup error:', whoisResult.reason);
    }

    // Analyze threat intelligence
    const threatIntel = analyzeThreatIntelligence(domain, domainDetails, domainHistory);

    // Build WHOIS response
    const whois = {
      domain,
      registrar: whoisData?.registrar || domainDetails?.registrar_name || 'Unknown',
      registrationDate: whoisData?.creationDate || domainDetails?.created_date || new Date().toISOString(),
      expirationDate: whoisData?.expirationDate || domainDetails?.expires_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      nameServers: domainDetails?.current_dns?.ns?.values || dnsData?.ns?.map((r: any) => r.value) || [],
      registrantOrg: whoisData?.registrantOrg || 'Unknown',
      registrantCountry: whoisData?.registrantCountry || 'Unknown',
      status: whoisData?.status || ['active']
    };

    // Build historical data
    const historicalData = domainHistory ? {
      ipHistory: domainHistory.records?.map((record: any) => ({
        ip: record.values?.[0]?.ip || 'Unknown',
        firstSeen: record.first_seen || new Date().toISOString(),
        lastSeen: record.last_seen || new Date().toISOString()
      })) || [],
      ownershipChanges: []
    } : undefined;

    // Build response
    const response = {
      domain,
      whois,
      dns: dnsData || {
        a: [],
        mx: [],
        txt: [],
        cname: [],
        ns: []
      },
      threatIntel,
      historicalData
    };

    return createSuccessResponse(response, origin);
  } catch (error: any) {
    console.error('Domain intelligence error:', error);
    return createErrorResponse(
      'Failed to analyze domain',
      500,
      origin
    );
  }
}

// Helper function to perform WHOIS lookup
async function performWHOISLookup(domain: string): Promise<any> {
  try {
    // Use a free WHOIS API service
    const response = await fetch(`https://api.whoisjson.com/v1/${domain}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('WHOIS API error');
    }

    const data = await response.json();
    return {
      registrar: data.registrar?.name || 'Unknown',
      creationDate: data.created_date || new Date().toISOString(),
      expirationDate: data.expires_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      registrantOrg: data.registrant?.organization || 'Unknown',
      registrantCountry: data.registrant?.country || 'Unknown',
      status: data.status || ['active']
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return null;
  }
}

// Helper function to analyze threat intelligence
function analyzeThreatIntelligence(domain: string, domainDetails: any, domainHistory: any): any {
  let riskScore = 0;
  let isMalicious = false;
  const categories: string[] = [];
  const sources: string[] = ['SecurityTrails'];

  // Domain age analysis
  if (domainDetails?.created_date) {
    const creationDate = new Date(domainDetails.created_date);
    const daysSinceCreation = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 30) {
      riskScore += 30;
      categories.push('Recently Registered');
    } else if (daysSinceCreation < 90) {
      riskScore += 15;
    }
  }

  // DNS changes analysis
  if (domainHistory?.records && domainHistory.records.length > 10) {
    riskScore += 20;
    categories.push('Frequent DNS Changes');
  }

  // Subdomain analysis
  if (domainDetails?.subdomains && domainDetails.subdomains > 100) {
    riskScore += 25;
    categories.push('Many Subdomains');
  }

  // Simple heuristics for malicious domains
  const suspiciousKeywords = ['bank', 'paypal', 'amazon', 'microsoft', 'google', 'apple'];
  const domainLower = domain.toLowerCase();
  
  for (const keyword of suspiciousKeywords) {
    if (domainLower.includes(keyword) && !domainLower.endsWith(`${keyword}.com`)) {
      riskScore += 40;
      categories.push('Potential Typosquatting');
      break;
    }
  }

  if (riskScore > 50) {
    isMalicious = true;
  }

  return {
    isMalicious,
    riskScore: Math.min(riskScore, 100),
    categories,
    lastSeen: domainHistory?.records?.[0]?.last_seen,
    sources
  };
} 