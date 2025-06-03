'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Progress } from '@repo/design-system/components/ui/progress';
import { Separator } from '@repo/design-system/components/ui/separator';
import { LoaderIcon, WifiIcon, LockIcon, UnlockIcon, AlertTriangleIcon } from 'lucide-react';
import { threatMonitorFetch } from '../utils/api';

interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered' | 'scanning';
  service?: string;
  version?: string;
}

interface ScanResult {
  host: string;
  ports: PortResult[];
  scanProgress: number;
  isScanning: boolean;
}

const COMMON_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 3306, service: 'MySQL' },
  { port: 1433, service: 'MSSQL' },
  { port: 27017, service: 'MongoDB' }
];

export function PortScanner() {
  const [host, setHost] = useState('');
  const [customPorts, setCustomPorts] = useState('');
  const [scanType, setScanType] = useState<'common' | 'custom'>('common');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    if (!host.trim()) return;

    setError(null);
    const ports = scanType === 'common' 
      ? COMMON_PORTS.map(p => p.port)
      : customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));

    if (ports.length === 0) {
      setError('Please specify ports to scan');
      return;
    }

    // Initialize scan result
    const initialResult: ScanResult = {
      host: host.trim(),
      ports: ports.map(port => ({
        port,
        status: 'scanning',
        service: COMMON_PORTS.find(cp => cp.port === port)?.service
      })),
      scanProgress: 0,
      isScanning: true
    };

    setResult(initialResult);

    try {
      // Use regular HTTP request instead of WebSocket
      const response = await threatMonitorFetch('/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim(), ports })
      });

      if (!response.ok) {
        throw new Error('Failed to perform port scan');
      }

      const data = await response.json();
      
      // Update result with scan data
      setResult(prev => prev ? {
        ...prev,
        ports: data.ports,
        scanProgress: 100,
        isScanning: false
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start port scan');
      setResult(prev => prev ? { ...prev, isScanning: false } : null);
    }
  };

  const getPortStatusIcon = (status: PortResult['status']) => {
    switch (status) {
      case 'open':
        return <UnlockIcon className="h-3 w-3 text-red-600" />;
      case 'closed':
        return <LockIcon className="h-3 w-3 text-gray-600" />;
      case 'filtered':
        return <AlertTriangleIcon className="h-3 w-3 text-yellow-600" />;
      case 'scanning':
        return <LoaderIcon className="h-3 w-3 animate-spin text-blue-600" />;
    }
  };

  const getPortStatusColor = (status: PortResult['status']) => {
    switch (status) {
      case 'open':
        return 'border-red-600 text-red-600';
      case 'closed':
        return 'border-gray-600 text-gray-600';
      case 'filtered':
        return 'border-yellow-600 text-yellow-600';
      case 'scanning':
        return 'border-blue-600 text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="space-y-3">
        <Input
          placeholder="Enter host/IP address (e.g., google.com)"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />

        {/* Scan Type Selection */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={scanType === 'common' ? 'default' : 'outline'}
            onClick={() => setScanType('common')}
            className="flex-1"
          >
            Common Ports
          </Button>
          <Button
            type="button"
            variant={scanType === 'custom' ? 'default' : 'outline'}
            onClick={() => setScanType('custom')}
            className="flex-1"
          >
            Custom Ports
          </Button>
        </div>

        {scanType === 'custom' && (
          <Input
            placeholder="Enter ports (e.g., 80,443,8080)"
            value={customPorts}
            onChange={(e) => setCustomPorts(e.target.value)}
          />
        )}

        <Button
          onClick={startScan}
          disabled={!host.trim() || (result?.isScanning ?? false)}
          className="w-full"
        >
          {result?.isScanning ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
              Scanning...
            </>
          ) : (
            <>
              <WifiIcon className="h-4 w-4 mr-2" />
              Start Port Scan
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Scan Results */}
      {result && (
        <div className="space-y-4">
          <Separator />
          
          {/* Scan Header */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Scanning {result.host}</span>
            {result.isScanning && (
              <Badge variant="outline" className="border-blue-600 text-blue-600">
                <LoaderIcon className="h-3 w-3 animate-spin mr-1" />
                In Progress
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {result.isScanning && (
            <div className="space-y-2">
              <Progress value={result.scanProgress} className="h-2" />
              <div className="text-sm text-muted-foreground text-center">
                {Math.round(result.scanProgress)}% complete
              </div>
            </div>
          )}

          {/* Port Results */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Port Results</div>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {result.ports.map((portResult) => (
                <div
                  key={portResult.port}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getPortStatusIcon(portResult.status)}
                    <span className="font-mono text-sm">{portResult.port}</span>
                    {portResult.service && (
                      <span className="text-sm text-muted-foreground">
                        ({portResult.service})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {portResult.version && (
                      <span className="text-xs text-muted-foreground">
                        {portResult.version}
                      </span>
                    )}
                    <Badge variant="outline" className={getPortStatusColor(portResult.status)}>
                      {portResult.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {!result.isScanning && (
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-semibold text-red-600">
                  {result.ports.filter(p => p.status === 'open').length}
                </div>
                <div className="text-muted-foreground">Open</div>
              </div>
              <div>
                <div className="font-semibold text-gray-600">
                  {result.ports.filter(p => p.status === 'closed').length}
                </div>
                <div className="text-muted-foreground">Closed</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">
                  {result.ports.filter(p => p.status === 'filtered').length}
                </div>
                <div className="text-muted-foreground">Filtered</div>
              </div>
              <div>
                <div className="font-semibold">
                  {result.ports.length}
                </div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 