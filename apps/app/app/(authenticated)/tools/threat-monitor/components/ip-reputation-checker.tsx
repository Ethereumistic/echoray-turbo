'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { LoaderIcon, AlertTriangleIcon, CheckCircleIcon, MapPinIcon, BuildingIcon } from 'lucide-react';
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

export function IpReputationChecker() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpReputationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkMyIp = async () => {
    setLoading(true);
    setError(null);
    setResult(null); // Clear any previous results
    try {
      // Get user's IP first
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
      {ip && !result && !error && (
        <div className="space-y-3">
          <Separator />
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Your IP Address</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="font-mono text-lg text-blue-900 dark:text-blue-100">{ip}</div>
              <div className="text-blue-700 dark:text-blue-300">
                Click "Check IP" above to analyze this IP's reputation
              </div>
            </div>
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