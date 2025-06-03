'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from '@repo/design-system/components/ui/card';
import { cn } from '@repo/design-system/lib/utils';
import {
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  PlugIcon,
  CreditCardIcon,
  AlertTriangleIcon,
} from 'lucide-react';

interface SettingsTab {
  id: string;
  label: string;
  description: string;
  component: React.ReactNode;
}

interface SettingsLayoutProps {
  tabs: SettingsTab[];
  currentTab: SettingsTab;
  companyId: string;
}

const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  general: SettingsIcon,
  security: ShieldIcon,
  members: UsersIcon,
  integrations: PlugIcon,
  billing: CreditCardIcon,
  advanced: AlertTriangleIcon,
};

export const SettingsLayout = ({ tabs, currentTab, companyId }: SettingsLayoutProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.push(`/${companyId}/settings?${params.toString()}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Settings Sidebar */}
      <div className="lg:w-48 space-y-2">
        <div className="lg:sticky lg:top-6 ">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab.id] || SettingsIcon;
              const isActive = currentTab.id === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    isActive && "bg-accent"
                  )}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium">{tab.label}</div>
                      {/* <div className="text-xs text-muted-foreground mt-0.5 hidden lg:block">
                        {tab.description}
                      </div> */}
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Tab Header */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = tabIcons[currentTab.id] || SettingsIcon;
                  return <Icon className="h-5 w-5" />;
                })()}
                <div>
                  <h2 className="text-xl font-semibold">{currentTab.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentTab.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {currentTab.component}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 