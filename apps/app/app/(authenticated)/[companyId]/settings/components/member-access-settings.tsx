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

interface MemberAccessSettingsProps {
  company: Company;
  stats: CompanyStats;
}

export const MemberAccessSettings = ({ company, stats }: MemberAccessSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Member Permissions</CardTitle>
          <CardDescription>
            Configure default access levels for new members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Member access settings will be configured here. This connects to the Roles & Permissions system.
          </p>
          <Button variant="outline" className="mt-4">
            Configure Permissions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 