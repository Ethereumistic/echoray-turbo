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
  GlobeIcon,
  CalendarIcon,
  ServerIcon,
  HistoryIcon
} from 'lucide-react';
import { threatMonitorFetch } from '../utils/api';

interface WhoisData {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  nameServers: (string | { nameserver?: string; nameserver_count?: number; nameserver_organization?: string })[];
  registrantOrg?: string;
  registrantCountry?: string;
  status: string[];
}

interface DnsRecord {
  type: string;
  value: string;
  ttl?: number;
}

interface ThreatIntel {
  isMalicious: boolean;
  riskScore: number;
  categories: string[];
  lastSeen?: string;
  sources: string[];
}

interface DomainIntelResult {
  domain: string;
  whois: WhoisData;
  dns: {
    a: DnsRecord[];
    mx: DnsRecord[];
    txt: DnsRecord[];
    cname: DnsRecord[];
    ns: DnsRecord[];
  };
  threatIntel: ThreatIntel;
  historicalData?: {
    ipHistory: Array<{ ip: string; firstSeen: string; lastSeen: string }>;
    ownershipChanges: Array<{ date: string; registrar: string }>;
  };
}

export function DomainIntelDashboard() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainIntelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDomain = async () => {
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Auto-format domain to remove protocol and extract just the domain
      let formattedDomain = domain.trim();
      
      // Remove protocol if present
      if (formattedDomain.startsWith('http://')) {
        formattedDomain = formattedDomain.replace('http://', '');
      } else if (formattedDomain.startsWith('https://')) {
        formattedDomain = formattedDomain.replace('https://', '');
      }
      
      // Remove www. prefix if present
      if (formattedDomain.startsWith('www.')) {
        formattedDomain = formattedDomain.replace('www.', '');
      }
      
      // Remove any path, query params, or fragments
      formattedDomain = formattedDomain.split('/')[0].split('?')[0].split('#')[0];

      const response = await threatMonitorFetch('/domain-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: formattedDomain })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze domain');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze domain');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeDomain();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Enter domain (e.g., example.com - protocols will be removed automatically)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          type="text"
        />

        <Button 
          type="submit" 
          disabled={loading || !domain.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              Analyzing Domain...
            </>
          ) : (
            <>
              <GlobeIcon className="h-4 w-4 mr-2" />
              Analyze Domain
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
          
          {/* Threat Assessment */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Threat Assessment</span>
            <Badge variant="outline" className={getRiskColor(result.threatIntel.riskScore)}>
              {!result.threatIntel.isMalicious ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
              )}
              {getRiskLevel(result.threatIntel.riskScore)} ({result.threatIntel.riskScore}%)
            </Badge>
          </div>

          {/* Domain Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Domain:</span>
              <span className="font-mono text-sm">{result.domain}</span>
            </div>
          </div>

          {/* Threat Categories */}
          {result.threatIntel.categories.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">Threat Categories</div>
              <div className="flex flex-wrap gap-2">
                {result.threatIntel.categories.map((category, index) => (
                  <Badge key={index} variant="destructive">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for detailed information */}
          <Tabs defaultValue="whois" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="whois">WHOIS</TabsTrigger>
              <TabsTrigger value="dns">DNS Records</TabsTrigger>
              <TabsTrigger value="threat">Threat Intel</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            {/* WHOIS Tab */}
            <TabsContent value="whois" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Registrar</span>
                  <span className="text-sm">{result.whois.registrar}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Registration Date
                  </span>
                  <span className="text-sm">{formatDate(result.whois.registrationDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Expiration Date
                  </span>
                  <div className="text-right">
                    <div className="text-sm">{formatDate(result.whois.expirationDate)}</div>
                    <div className={`text-xs ${getDaysUntilExpiry(result.whois.expirationDate) < 30 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {getDaysUntilExpiry(result.whois.expirationDate)} days remaining
                    </div>
                  </div>
                </div>

                {result.whois.registrantOrg && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Organization</span>
                    <span className="text-sm">{result.whois.registrantOrg}</span>
                  </div>
                )}

                {result.whois.registrantCountry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Country</span>
                    <span className="text-sm">{result.whois.registrantCountry}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Name Servers</span>
                  <div className="space-y-1">
                    {result.whois.nameServers.map((ns, index) => (
                      <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                        {typeof ns === 'string' 
                          ? ns 
                          : (typeof ns === 'object' && ns?.nameserver 
                              ? ns.nameserver 
                              : 'Invalid nameserver data'
                            )
                        }
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex flex-wrap gap-1">
                    {result.whois.status.map((status, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* DNS Records Tab */}
            <TabsContent value="dns" className="mt-4">
              <div className="space-y-4">
                {Object.entries(result.dns).map(([recordType, records]) => {
                  if (!records.length) return null;
                  
                  return (
                    <div key={recordType} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ServerIcon className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase">{recordType} Records</span>
                      </div>
                      <div className="space-y-1">
                        {records.map((record, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <span className="font-mono">{record.value}</span>
                            {record.ttl && (
                              <span className="text-xs text-muted-foreground">
                                TTL: {record.ttl}s
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            {/* Threat Intel Tab */}
            <TabsContent value="threat" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Malicious</span>
                  <Badge variant={result.threatIntel.isMalicious ? 'destructive' : 'secondary'}>
                    {result.threatIntel.isMalicious ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <span className={`text-sm font-medium ${getRiskColor(result.threatIntel.riskScore).split(' ')[0]}`}>
                    {result.threatIntel.riskScore}%
                  </span>
                </div>

                {result.threatIntel.lastSeen && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Seen</span>
                    <span className="text-sm">{formatDate(result.threatIntel.lastSeen)}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Intelligence Sources</span>
                  <div className="flex flex-wrap gap-1">
                    {result.threatIntel.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Historical Data Tab */}
            <TabsContent value="history" className="mt-4">
              {result.historicalData ? (
                <div className="space-y-4">
                  {/* IP History */}
                  {result.historicalData.ipHistory.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">IP History</span>
                      </div>
                      <div className="space-y-1">
                        {result.historicalData.ipHistory.map((record, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <span className="font-mono">{record.ip}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(record.firstSeen)} - {formatDate(record.lastSeen)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ownership Changes */}
                  {result.historicalData.ownershipChanges.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Ownership Changes</span>
                      </div>
                      <div className="space-y-1">
                        {result.historicalData.ownershipChanges.map((change, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <span>{change.registrar}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(change.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Historical data not available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 