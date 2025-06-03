'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { LoaderIcon, AlertTriangleIcon, CheckCircleIcon, MapPinIcon, BuildingIcon, GlobeIcon, ServerIcon } from 'lucide-react';
import { threatMonitorFetch } from '../utils/api';

interface IpReputationData {
  ip: string;
  isSafe: boolean;
  riskScore: number;
  country: string;
  isp: string;
  threatType?: string;
  blacklisted: boolean;
  abuseConfidence: number;
}

interface PublicIpData {
  ip: string;
  ipType: string;
  geolocation?: {
    city: string;
    region: string;
    country: string;
    postal: string;
    timezone: string;
    coordinates?: { latitude: number; longitude: number };
  };
  network?: {
    asn: string;
    asnName: string;
    isp: string;
    hostname: string;
  };
  privacy?: {
    isHosting: boolean;
  };
  source?: string;
  note?: string;
  debug?: {
    detectedClientIP: string;
    requestHeaders: Record<string, string | null>;
  };
  fallback?: boolean;
}

export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpReputationData | null>(null);
  const [publicIpData, setPublicIpData] = useState<PublicIpData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkMyIp = async () => {
    setLoading(true);
    setError(null);
    setResult(null); // Clear any previous results
    setPublicIpData(null);
    try {
      // Get user's comprehensive IP data
      const ipResponse = await threatMonitorFetch('/my-ip');
      
      if (!ipResponse.ok) {
        throw new Error('Failed to get your IP address');
      }
      
      const ipData = await ipResponse.json();
      
      if (!ipData?.ip) {
        throw new Error('Invalid response: IP address not found');
      }
      
      const userIp = ipData.ip.trim();
      setIp(userIp);
      setPublicIpData(ipData);
      
      // Don't automatically run reputation check - just show the IP
      // User can manually click "Check IP" if they want to check reputation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get your IP address');
    } finally {
      setLoading(false);
    }
  };

  const checkIpReputation = async (ipToCheck?: string) => {
    const targetIp = ipToCheck || ip;
    if (!targetIp || !targetIp.trim()) {
      setError('Please enter a valid IP address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await threatMonitorFetch('/ip-reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: targetIp.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to check IP reputation');
      }

      const data = await response.json();
      
      if (!data) {
        throw new Error('Invalid response: No data received');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check IP reputation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkIpReputation();
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 border-red-600';
    if (score >= 50) return 'text-orange-600 border-orange-600';
    if (score >= 25) return 'text-yellow-600 border-yellow-600';
    return 'text-green-600 border-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low Risk';
    return 'Safe';
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={loading || !ip.trim()}
            className="whitespace-nowrap"
          >
            {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : 'Check IP'}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={checkMyIp}
          disabled={loading}
          className="w-full"
        >
          Check My IP
        </Button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* IP Display (when Check My IP is used but no reputation check yet) */}
      {ip && !result && !error && publicIpData && (
        <div className="space-y-4">
          <Separator />
          
          {/* Main IP Card */}
          <div className="p-4 bg-primary/10 border border-primary rounded-lg  ">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Your Public IP Information</span>
            </div>
            
            {/* IP Address */}
            <div className="text-center p-3 bg-background rounded-lg border mb-4">
              <div className="text-2xl font-mono font-bold text-foreground">{publicIpData.ip}</div>
              <div className="text-sm text-primary mt-1">{publicIpData.ipType} Address</div>
            </div>

            {/* Geolocation Information */}
            {publicIpData.geolocation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPinIcon className="h-4 w-4" />
                    Location
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">City:</span>
                      <span className="font-medium">{publicIpData.geolocation.city || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Region:</span>
                      <span className="font-medium">{publicIpData.geolocation.region || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Country:</span>
                      <span className="font-medium">{publicIpData.geolocation.country || 'Unknown'}</span>
                    </div>
                    {publicIpData.geolocation.postal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Postal:</span>
                        <span className="font-medium">{publicIpData.geolocation.postal}</span>
                      </div>
                    )}
                    {publicIpData.geolocation.timezone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                        <span className="font-medium">{publicIpData.geolocation.timezone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Information */}
                {publicIpData.network && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <ServerIcon className="h-4 w-4" />
                      Network & ISP
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {publicIpData.network.asn && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ASN:</span>
                          <span className="font-medium">{publicIpData.network.asn}</span>
                        </div>
                      )}
                      {publicIpData.network.isp && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ISP:</span>
                          <span className="font-medium text-right max-w-64 text-nowrap" title={publicIpData.network.isp}>
                            {publicIpData.network.isp}
                          </span>
                        </div>
                      )}
                      {publicIpData.network.hostname && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                          <span className="font-medium text-right max-w-64 text-nowrap font-mono text-xs" title={publicIpData.network.hostname}>
                            {publicIpData.network.hostname}
                          </span>
                        </div>
                      )}
                      {publicIpData.privacy?.isHosting !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hosting:</span>
                          <Badge variant={publicIpData.privacy.isHosting ? "outline" : "secondary"} className="text-xs">
                            {publicIpData.privacy.isHosting ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <div className="text-center pt-3 border-t">
              <div className="text-sm text-primary mb-3">
                Want to check this IP's security reputation and threat status?
              </div>
              <Button 
                onClick={() => checkIpReputation()}
                variant="outline"
                className="border-primary mx-2 text-foreground hover:bg-primary/10"
              >
                <AlertTriangleIcon className="h-4 w-4 mr-2" />
                Analyze IP Security & Reputation
              </Button>

              <Button 
                disabled={true}
                variant="outline"
                className="border-primary mx-2 text-foreground "
              >
                <GlobeIcon  className="h-4 w-4 mr-2" />
                Geolocation (Coming Soon)
              </Button>
            </div>

            {/* Debug Information */}
            {publicIpData.debug && (
              <div className="mt-4 pt-3 border-t">
                <details className="text-xs text-gray-500 dark:text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mb-2">
                    🔍 Debug Information (Click to expand)
                  </summary>
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono">
                    <div>
                      <strong>Detected Client IP:</strong> {publicIpData.debug.detectedClientIP}
                    </div>
                    <div>
                      <strong>Request Headers:</strong>
                    </div>
                    <div className="pl-4 space-y-1">
                      {Object.entries(publicIpData.debug.requestHeaders).map(([header, value]) => (
                        <div key={header} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{header}:</span>
                          <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {value || 'null'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {publicIpData.fallback && (
                      <div className="text-yellow-600 dark:text-yellow-400">
                        ⚠️ Using fallback IP detection
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Data Source Footer */}
            {publicIpData.source && (
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 dark:text-gray-400 text-center">
                Data provided by {publicIpData.source}
                {publicIpData.note && <span className="block mt-1">{publicIpData.note}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <Separator />
          
          {/* Risk Score */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Risk Assessment</span>
            <Badge variant="outline" className={getRiskColor(result.riskScore)}>
              {result.isSafe ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
              )}
              {getRiskLevel(result.riskScore)} ({result.riskScore}%)
            </Badge>
          </div>

          {/* IP Information */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-mono">{result.ip}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                Location
              </span>
              <span>{result.country}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <BuildingIcon className="h-3 w-3" />
                ISP
              </span>
              <span className="text-right">{result.isp}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blacklisted</span>
              <Badge variant={result.blacklisted ? "destructive" : "secondary"}>
                {result.blacklisted ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Abuse Confidence</span>
              <span className={`font-medium ${result.abuseConfidence > 50 ? 'text-red-600' : 'text-green-600'}`}>
                {result.abuseConfidence}%
              </span>
            </div>

            {result.threatType && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Threat Type</span>
                <Badge variant="destructive">{result.threatType}</Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 