# Threat Monitor API

A comprehensive threat intelligence and security analysis API providing IP reputation checking, URL scanning, domain intelligence, and port scanning capabilities.

## Features

### 🛡️ IP Intelligence Tools

**IP Reputation Checker** (`/api/threat-monitor/ip-reputation`)
- **Integrations**: [AbuseIPDB](https://www.abuseipdb.com/), [IP-API](https://ip-api.com/) for geolocation
- **Rate Limit**: Once per day per user
- **Response**: IP safety assessment, abuse confidence, geolocation, ISP info
- **API Limits**: AbuseIPDB allows 1,000 daily requests for `check` endpoint

**My IP** (`/api/threat-monitor/my-ip`)
- **Purpose**: Returns user's real IP address
- **No authentication required**
- **No rate limiting**

**Port Scanner** (`/api/threat-monitor/port-scan`)
- **Features**: Scans up to 50 ports, service detection, response times
- **Rate Limit**: Once per day per user
- **Simulation**: Uses realistic port scanning simulation (edge runtime limitation)

### 🔍 URL Analysis Tools

**URL Safety Scanner** (`/api/threat-monitor/url-scan`)
- **Integrations**: [PhishTank](https://phishtank.org/api_info.php), SSL Labs API
- **Features**: Phishing detection, SSL certificate analysis, screenshot capture (placeholder)
- **Rate Limit**: Once per day per user
- **PhishTank**: Uses public API without authentication

**Domain Intelligence** (`/api/threat-monitor/domain-intel`)
- **Integrations**: [SecurityTrails](https://docs.securitytrails.com/docs/overview), WHOIS API, Cloudflare DNS-over-HTTPS
- **Features**: WHOIS data, DNS records, threat intelligence, historical data
- **Rate Limit**: Once per day per user
- **SecurityTrails**: Subject to monthly quotas and rate limiting

## Environment Variables

Add these to your `.env` file:

```bash
# Required API Keys
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
SECURITYTRAILS_API_KEY=your_securitytrails_api_key_here

# PhishTank requires no API key for basic usage
```

## Rate Limiting

Each endpoint enforces **once per day per user** limits to:
- Comply with external API quotas
- Prevent abuse
- Manage costs

Rate limiting is enforced through database tracking (`threatMonitorUsage` table).

## API Usage Limits

### AbuseIPDB Daily Limits
- `check` endpoint: 0/1,000 requests
- `blacklist` endpoint: 0/5 requests  
- `report` endpoint: 0/1,000 requests

### SecurityTrails
- Monthly quotas apply
- Rate limited to specific requests per second
- Automatic retry recommended after 1-second intervals

### PhishTank
- Public API with rate limiting
- No authentication required
- Uses `User-Agent: echoray-threat-monitor/1.0`

## Database Schema

The rate limiting requires a `threatMonitorUsage` table:

```sql
CREATE TABLE threatMonitorUsage (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_endpoint_date (userId, endpoint, createdAt)
);
```

## API Endpoints

### 1. Get User IP
```http
GET /api/threat-monitor/my-ip
```

**Response:**
```json
{
  "ip": "192.168.1.1",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Check IP Reputation
```http
POST /api/threat-monitor/ip-reputation
Content-Type: application/json
Authorization: Bearer <token>

{
  "ip": "192.168.1.1"
}
```

**Response:**
```json
{
  "ip": "192.168.1.1",
  "isSafe": true,
  "riskScore": 15,
  "country": "United States",
  "isp": "Example ISP",
  "threatType": null,
  "blacklisted": false,
  "abuseConfidence": 0,
  "details": {
    "lastReported": null,
    "totalReports": 0,
    "countryCode": "US",
    "usageType": "isp",
    "proxy": false,
    "hosting": false
  }
}
```

### 3. Scan URL
```http
POST /api/threat-monitor/url-scan
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://example.com",
  "captureScreenshot": false
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "isSafe": true,
  "riskScore": 0,
  "threats": [],
  "screenshot": null,
  "ssl": {
    "valid": true,
    "issuer": "Let's Encrypt",
    "expires": "2024-12-31T23:59:59.000Z",
    "daysUntilExpiry": 365
  },
  "scanSources": {
    "googleSafeBrowsing": "safe",
    "urlVoid": 5,
    "phishTank": false
  }
}
```

### 4. Port Scan
```http
POST /api/threat-monitor/port-scan
Content-Type: application/json
Authorization: Bearer <token>

{
  "host": "example.com",
  "ports": [80, 443, 22]
}
```

**Response:**
```json
{
  "host": "example.com",
  "ports": [
    {
      "port": 80,
      "status": "open",
      "service": "HTTP",
      "version": "Apache/2.4.41",
      "responseTime": 150
    }
  ],
  "scanTime": "2024-01-01T12:00:00.000Z",
  "summary": {
    "total": 3,
    "open": 2,
    "closed": 1,
    "filtered": 0
  }
}
```

### 5. Domain Intelligence
```http
POST /api/threat-monitor/domain-intel
Content-Type: application/json
Authorization: Bearer <token>

{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "domain": "example.com",
  "whois": {
    "domain": "example.com",
    "registrar": "Example Registrar",
    "registrationDate": "1995-08-14T04:00:00.000Z",
    "expirationDate": "2025-08-13T04:00:00.000Z",
    "nameServers": ["ns1.example.com", "ns2.example.com"],
    "registrantOrg": "Example Organization",
    "registrantCountry": "US",
    "status": ["clientDeleteProhibited"]
  },
  "dns": {
    "a": [{"type": "A", "value": "93.184.216.34", "ttl": 3600}],
    "mx": [],
    "txt": [],
    "cname": [],
    "ns": []
  },
  "threatIntel": {
    "isMalicious": false,
    "riskScore": 0,
    "categories": [],
    "lastSeen": null,
    "sources": ["SecurityTrails"]
  },
  "historicalData": {
    "ipHistory": [],
    "ownershipChanges": []
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Rate limit exceeded: You can only check IP reputation once per day"
}
```

**Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable (external API issues)

## CORS Support

All endpoints support CORS for allowed origins:
- `http://localhost:3000` (development)
- `https://app.echoray.io` (production)
- Additional origins as configured

## Security Features

- **Authentication**: Clerk-based user authentication required
- **Rate Limiting**: Database-tracked daily limits
- **Input Validation**: IP, URL, and domain format validation
- **Error Handling**: Graceful failure with external APIs
- **CORS Protection**: Restricted origin access

## Architecture

- **Edge Runtime**: All endpoints run on Vercel Edge Runtime
- **Modular Design**: Shared utilities in `utils.ts`
- **Clean Code**: TypeScript with proper error handling
- **Parallel Processing**: Multiple API calls using `Promise.allSettled`
- **Fallback Mechanisms**: Graceful degradation when external APIs fail

## Future Enhancements

1. **Real Port Scanning**: Implement actual network scanning (requires Node.js runtime)
2. **WebSocket Support**: Real-time updates for long-running scans
3. **Screenshot Capture**: Implement Puppeteer for URL screenshots
4. **Additional APIs**: Google Safe Browsing, VirusTotal integration
5. **Caching Layer**: Redis/memory caching for frequently queried resources 