'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { 
  BotIcon, 
  SearchIcon, 
  AtomIcon, 
  ArrowRightIcon,
  CodeIcon,
  DatabaseIcon,
  ShieldIcon,
  BrainIcon,
  BarChartIcon,
  LockIcon,
  ScanIcon,
  GlobeIcon
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const tools = [
  // Web Tools
  {
    title: 'QR Generator',
    description: 'Generate QR codes for URLs, text, and more with customizable styling options.',
    icon: BotIcon,
    url: '/tools/qr-generator',
    status: 'available',
    category: 'Web'
  },
  {
    title: 'Website Builder',
    description: 'Create stunning websites with our drag-and-drop builder and modern templates.',
    icon: CodeIcon,
    url: '/tools/website-builder',
    status: 'coming-soon',
    category: 'Web'
  },
  {
    title: 'API Explorer',
    description: 'Test and explore APIs with an intuitive interface and comprehensive documentation.',
    icon: GlobeIcon,
    url: '/tools/api-explorer',
    status: 'coming-soon',
    category: 'Web'
  },
  // AI & BI Tools
  {
    title: 'Explorer',
    description: 'Explore and analyze data with advanced search and filtering capabilities.',
    icon: SearchIcon,
    url: '/tools/explorer',
    status: 'coming-soon',
    category: 'AI & BI'
  },
  {
    title: 'Smart Analytics',
    description: 'AI-powered analytics platform for business intelligence and data insights.',
    icon: BarChartIcon,
    url: '/tools/smart-analytics',
    status: 'coming-soon',
    category: 'AI & BI'
  },
  {
    title: 'Neural Networks',
    description: 'Build and train neural networks with our intuitive visual interface.',
    icon: BrainIcon,
    url: '/tools/neural-networks',
    status: 'coming-soon',
    category: 'AI & BI'
  },
  {
    title: 'Data Pipeline',
    description: 'Create automated data pipelines for ETL processes and real-time analytics.',
    icon: DatabaseIcon,
    url: '/tools/data-pipeline',
    status: 'coming-soon',
    category: 'AI & BI'
  },
  // Cyber Security Tools
  {
    title: 'Quantum',
    description: 'Advanced quantum computing simulations and algorithm testing platform.',
    icon: AtomIcon,
    url: '/tools/quantum',
    status: 'coming-soon',
    category: 'Cyber Security'
  },
  {
    title: 'Security Scanner',
    description: 'Comprehensive security scanning and vulnerability assessment tools.',
    icon: ScanIcon,
    url: '/tools/security-scanner',
    status: 'coming-soon',
    category: 'Cyber Security'
  },
  {
    title: 'Encryption Suite',
    description: 'Advanced encryption and decryption tools for secure data protection.',
    icon: LockIcon,
    url: '/tools/encryption-suite',
    status: 'coming-soon',
    category: 'Cyber Security'
  },
  {
    title: 'Threat Monitor',
    description: 'Real-time threat detection and monitoring dashboard for your infrastructure.',
    icon: ShieldIcon,
    url: '/tools/threat-monitor',
    status: 'available',
    category: 'Cyber Security'
  }
];

const categories = ['Web', 'AI & BI', 'Cyber Security'];

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('Web');
  
  const filteredTools = tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground">
          Powerful tools to enhance your productivity and creativity.
        </p>
      </div>
      
      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {/* Tools Grid */}
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                const isAvailable = tool.status === 'available';
                
                return (
                  <Card key={tool.title} className="relative overflow-hidden transition-all hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                            <Badge variant={isAvailable ? 'default' : 'secondary'} className="mt-1">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-2">
                        {tool.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        {isAvailable ? (
                          <Button asChild className="w-full">
                            <Link href={tool.url} className="flex items-center gap-2">
                              Open Tool
                              <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled className="w-full">
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Additional Info */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h3 className="mb-2 text-lg font-semibold">More Tools Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          We're constantly working on new tools to help you be more productive. 
          Check back regularly for updates and new releases.
        </p>
      </div>
    </div>
  );
} 