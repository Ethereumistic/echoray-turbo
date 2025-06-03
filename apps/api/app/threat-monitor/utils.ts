import { database } from '@repo/database';
import { NextResponse } from 'next/server';

// Rate limiting - one request per day per user per endpoint
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; resetTime?: Date }> {
  try {
    const db = database as any;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has made a request today for this endpoint
    const existingRequest = await db.threatMonitorUsage.findFirst({
      where: {
        userId,
        endpoint,
        createdAt: {
          gte: today
        }
      }
    });

    if (existingRequest) {
      const resetTime = new Date(today);
      resetTime.setDate(resetTime.getDate() + 1);
      return { allowed: false, resetTime };
    }

    // Record this request
    await db.threatMonitorUsage.create({
      data: {
        userId,
        endpoint,
        createdAt: new Date()
      }
    });

    return { allowed: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request but log the error
    return { allowed: true };
  }
}

// AbuseIPDB API client
export class AbuseIPDBClient {
  private apiKey: string;
  private baseUrl = 'https://api.abuseipdb.com/api/v2';

  constructor() {
    this.apiKey = process.env.ABUSEIPDB_API_KEY!;
    if (!this.apiKey) {
      throw new Error('ABUSEIPDB_API_KEY environment variable is required');
    }
  }

  async checkIP(ip: string): Promise<any> {
    const params = new URLSearchParams({
      ipAddress: ip,
      maxAgeInDays: '90',
      verbose: 'true'
    });

    const response = await fetch(`${this.baseUrl}/check?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`);
    }

    return response.json();
  }
}

// PhishTank API client (no auth required)
export class PhishTankClient {
  private baseUrl = 'http://checkurl.phishtank.com/checkurl/';

  async checkURL(url: string): Promise<any> {
    const formData = new FormData();
    formData.append('url', encodeURIComponent(url));
    formData.append('format', 'json');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'echoray-threat-monitor/1.0'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`PhishTank API error: ${response.status}`);
    }

    return response.json();
  }
}

// SecurityTrails API client
export class SecurityTrailsClient {
  private apiKey: string;
  private baseUrl = 'https://api.securitytrails.com/v1';

  constructor() {
    this.apiKey = process.env.SECURITYTRAILS_API_KEY!;
    if (!this.apiKey) {
      throw new Error('SECURITYTRAILS_API_KEY environment variable is required');
    }
  }

  async getDomainDetails(domain: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/domain/${domain}`, {
      headers: {
        'APIKEY': this.apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('SecurityTrails rate limit exceeded');
      }
      throw new Error(`SecurityTrails API error: ${response.status}`);
    }

    return response.json();
  }

  async getDomainHistory(domain: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/history/${domain}/dns/a`, {
      headers: {
        'APIKEY': this.apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('SecurityTrails rate limit exceeded');
      }
      throw new Error(`SecurityTrails API error: ${response.status}`);
    }

    return response.json();
  }
}

// IP geolocation using free service
export async function getIPGeolocation(ip: string): Promise<any> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,org,as,mobile,proxy,hosting`);
    
    if (!response.ok) {
      throw new Error(`IP geolocation API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('IP geolocation error:', error);
    return {
      status: 'fail',
      country: 'Unknown',
      isp: 'Unknown'
    };
  }
}

// Get user's real IP address
export function getRealIP(request: Request): string {
  // Try various headers that might contain the real IP
  // Order matters - more trusted headers first
  
  // Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    console.log('Using CF-Connecting-IP:', cfConnectingIP);
    return cfConnectingIP;
  }
  
  // Standard proxy headers
  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP && isValidIP(xRealIP)) {
    console.log('Using X-Real-IP:', xRealIP);
    return xRealIP;
  }
  
  // X-Forwarded-For (can contain multiple IPs, get the first one)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    const firstIP = forwardedFor.split(',')[0].trim();
    if (isValidIP(firstIP)) {
      console.log('Using X-Forwarded-For (first IP):', firstIP);
      return firstIP;
    }
  }
  
  // Other common headers
  const xClientIP = request.headers.get('x-client-ip');
  if (xClientIP && isValidIP(xClientIP)) {
    console.log('Using X-Client-IP:', xClientIP);
    return xClientIP;
  }
  
  const xForwarded = request.headers.get('x-forwarded');
  if (xForwarded && isValidIP(xForwarded)) {
    console.log('Using X-Forwarded:', xForwarded);
    return xForwarded;
  }
  
  const xClusterClientIP = request.headers.get('x-cluster-client-ip');
  if (xClusterClientIP && isValidIP(xClusterClientIP)) {
    console.log('Using X-Cluster-Client-IP:', xClusterClientIP);
    return xClusterClientIP;
  }
  
  console.log('No valid client IP found in headers, using fallback');
  
  // Fallback for different environments
  if (process.env.NODE_ENV === 'development') {
    // In development, return a public IP for testing
    return '8.8.8.8';
  }
  
  // Production fallback
  return '127.0.0.1';
}

// Helper function to validate IP addresses
function isValidIP(ip: string): boolean {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return false;
  }
  
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 validation (basic)
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  return false;
}

// DNS lookup utilities
export async function performDNSLookup(domain: string): Promise<any> {
  // Since we're in a browser/edge environment, we'll use a DNS over HTTPS service
  const dnsQueries = [
    { type: 'A', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=A` },
    { type: 'MX', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX` },
    { type: 'TXT', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=TXT` },
    { type: 'CNAME', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME` },
    { type: 'NS', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=NS` }
  ];

  const results: any = {
    a: [],
    mx: [],
    txt: [],
    cname: [],
    ns: []
  };

  for (const query of dnsQueries) {
    try {
      const response = await fetch(query.url, {
        headers: {
          'Accept': 'application/dns-json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.Answer) {
          results[query.type.toLowerCase()] = data.Answer.map((record: any) => ({
            type: record.type,
            value: record.data,
            ttl: record.TTL
          }));
        }
      }
    } catch (error) {
      console.error(`DNS lookup error for ${query.type}:`, error);
    }
  }

  return results;
}

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
  origin?: string | null
): NextResponse {
  const { corsErrorResponse } = require('../utils/cors');
  return corsErrorResponse(message, { status, origin });
}

// Success response helper
export function createSuccessResponse(
  data: any,
  origin?: string | null
): NextResponse {
  const { corsResponse } = require('../utils/cors');
  return corsResponse(data, { origin });
} 