'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { ShieldIcon, WifiIcon, SearchIcon, GlobeIcon } from 'lucide-react';

// Import components (we'll create these next)
import { IpReputationChecker } from './components/ip-reputation-checker';
import { PortScanner } from './components/port-scanner';
import { UrlSafetyScanner } from './components/url-safety-scanner';
import { DomainIntelDashboard } from './components/domain-intel-dashboard';

const toolCategories = [
  {
    id: 'ip-intelligence',
    label: 'IP Intelligence',
    icon: WifiIcon,
    description: 'IP reputation checking and port scanning tools'
  },
  {
    id: 'url-analysis',
    label: 'URL Analysis', 
    icon: SearchIcon,
    description: 'URL safety scanning and domain intelligence'
  }
];

export default function ThreatMonitorPage() {
  const [activeCategory, setActiveCategory] = useState('ip-intelligence');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
            <ShieldIcon className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Threat Monitor</h1>
            <p className="text-muted-foreground">
              Real-time threat detection and security analysis tools
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="h-2 w-2 bg-green-600 rounded-full mr-2" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Tool Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {toolCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* IP Intelligence Tools */}
        <TabsContent value="ip-intelligence" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* IP Reputation Checker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  IP Reputation Checker
                </CardTitle>
                <CardDescription>
                  Check IP addresses against threat intelligence databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IpReputationChecker />
              </CardContent>
            </Card>

            {/* Port Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WifiIcon className="h-5 w-5" />
                  Port Scanner
                </CardTitle>
                <CardDescription>
                  Scan common ports and identify open services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortScanner />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* URL Analysis Tools */}
        <TabsContent value="url-analysis" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* URL Safety Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="h-5 w-5" />
                  URL Safety Scanner
                </CardTitle>
                <CardDescription>
                  Analyze URLs for threats and security issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UrlSafetyScanner />
              </CardContent>
            </Card>

            {/* Domain Intel Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  Domain Intelligence
                </CardTitle>
                <CardDescription>
                  WHOIS, DNS analysis, and domain threat intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DomainIntelDashboard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldIcon className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Security Notice
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                These tools are for legitimate security research and testing purposes only. 
                Always ensure you have proper authorization before scanning or analyzing external systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 