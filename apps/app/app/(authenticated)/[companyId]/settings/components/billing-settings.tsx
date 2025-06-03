import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';

interface Company {
  id: string;
  name: string;
}

interface CompanyStats {
  totalMembers: number;
  activeDepartments: number;
  pendingInvitations: number;
}

interface BillingSettingsProps {
  company: Company;
  stats: CompanyStats;
}

export const BillingSettings = ({ company, stats }: BillingSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>
            Manage your subscription, billing, and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Billing and subscription settings will be configured here.
          </p>
          <Button variant="outline" className="mt-4">
            Manage Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 