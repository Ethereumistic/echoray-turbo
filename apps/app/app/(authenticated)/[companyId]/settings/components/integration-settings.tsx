import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';

interface Company {
  id: string;
  name: string;
}

interface IntegrationSettingsProps {
  company: Company;
}

export const IntegrationSettings = ({ company }: IntegrationSettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API & Integrations</CardTitle>
          <CardDescription>
            Manage API keys, webhooks, and third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Integration settings will be configured here.
          </p>
          <Button variant="outline" className="mt-4">
            Manage Integrations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 