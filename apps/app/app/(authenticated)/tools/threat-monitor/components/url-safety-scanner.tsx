'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { 
  LoaderIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  CameraIcon, 
  ShieldIcon,
  ClockIcon,
  ExternalLinkIcon 
} from 'lucide-react';
import { threatMonitorFetch } from '../utils/api';

interface UrlScanResult {
  url: string;
  isSafe: boolean;
  riskScore: number;
  threats: string[];
  screenshot?: string;
  ssl?: {
    valid: boolean;
    issuer: string;
    expires: string;
    daysUntilExpiry: number;
  };
  scanSources: {
    googleSafeBrowsing: 'safe' | 'malware' | 'phishing' | 'unwanted' | 'error';
    urlVoid: number; // risk score 0-100
    phishTank: boolean; // true if in phishing database
  };
}

export function UrlSafetyScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captureScreenshot, setCaptureScreenshot] = useState(true);

  const scanUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Auto-format URL to ensure it has a protocol
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const response = await threatMonitorFetch('/url-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: formattedUrl,
          captureScreenshot 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan URL');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scanUrl();
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

  const getSourceStatusBadge = (source: string, status: any) => {
    switch (source) {
      case 'googleSafeBrowsing':
        return (
          <Badge variant={status === 'safe' ? 'secondary' : 'destructive'}>
            Google: {status}
          </Badge>
        );
      case 'urlVoid':
        return (
          <Badge variant={status < 25 ? 'secondary' : status < 75 ? 'outline' : 'destructive'}>
            URLVoid: {status}%
          </Badge>
        );
      case 'phishTank':
        return (
          <Badge variant={status ? 'destructive' : 'secondary'}>
            PhishTank: {status ? 'Listed' : 'Clean'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Enter URL (e.g., example.com - https:// will be added automatically)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
        />
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="screenshot"
            checked={captureScreenshot}
            onChange={(e) => setCaptureScreenshot(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="screenshot" className="text-sm text-muted-foreground">
            Capture screenshot (may take longer)
          </label>
        </div>

        <Button 
          type="submit" 
          disabled={loading || !url.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              Scanning URL...
            </>
          ) : (
            <>
              <ShieldIcon className="h-4 w-4 mr-2" />
              Scan URL
            </>
          )}
        </Button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <Separator />
          
          {/* Risk Assessment */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Safety Assessment</span>
            <Badge variant="outline" className={getRiskColor(result.riskScore)}>
              {result.isSafe ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
              )}
              {getRiskLevel(result.riskScore)} ({result.riskScore}%)
            </Badge>
          </div>

          {/* URL Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">URL:</span>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 hover:underline flex items-center gap-1"
              >
                {result.url}
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Scan Sources */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Scan Sources</div>
            <div className="flex flex-wrap gap-2">
              {getSourceStatusBadge('googleSafeBrowsing', result.scanSources.googleSafeBrowsing)}
              {getSourceStatusBadge('urlVoid', result.scanSources.urlVoid)}
              {getSourceStatusBadge('phishTank', result.scanSources.phishTank)}
            </div>
          </div>

          {/* Threats */}
          {result.threats.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">Detected Threats</div>
              <div className="space-y-1">
                {result.threats.map((threat, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {threat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for detailed information */}
          <Tabs defaultValue="ssl" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ssl">SSL Certificate</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
            </TabsList>
            
            {/* SSL Certificate Tab */}
            <TabsContent value="ssl" className="mt-4">
              {result.ssl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Certificate Status</span>
                    <Badge variant={result.ssl.valid ? 'secondary' : 'destructive'}>
                      {result.ssl.valid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Issuer</span>
                    <span className="text-sm">{result.ssl.issuer}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      Expires
                    </span>
                    <div className="text-right">
                      <div className="text-sm">{result.ssl.expires}</div>
                      <div className={`text-xs ${result.ssl.daysUntilExpiry < 30 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {result.ssl.daysUntilExpiry} days remaining
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No SSL certificate information available
                </div>
              )}
            </TabsContent>
            
            {/* Screenshot Tab */}
            <TabsContent value="screenshot" className="mt-4">
              {result.screenshot ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CameraIcon className="h-4 w-4" />
                    Website Screenshot
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={result.screenshot} 
                      alt="Website screenshot" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {captureScreenshot 
                    ? 'Screenshot capture failed or not available' 
                    : 'Screenshot capture was disabled'
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 