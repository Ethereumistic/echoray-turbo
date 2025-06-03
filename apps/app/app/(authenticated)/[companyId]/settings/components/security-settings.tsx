'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Switch } from '@repo/design-system/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import {
  ShieldIcon,
  KeyIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface SecuritySettingsProps {
  company: Company;
}

export const SecuritySettings = ({ company }: SecuritySettingsProps) => {
  const [settings, setSettings] = useState({
    requireTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 24, // hours
    allowPasswordReset: true,
    requireStrongPasswords: true,
  });

  const handleToggle = (field: string) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: parseInt(value) || value }));
  };

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldIcon className="h-5 w-5" />
            <span>Authentication</span>
          </CardTitle>
          <CardDescription>
            Configure authentication requirements for all team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                All members must enable 2FA to access the company
              </p>
            </div>
            <Switch
              checked={settings.requireTwoFactor}
              onCheckedChange={() => handleToggle('requireTwoFactor')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Password Reset</Label>
              <p className="text-sm text-muted-foreground">
                Members can reset their passwords via email
              </p>
            </div>
            <Switch
              checked={settings.allowPasswordReset}
              onCheckedChange={() => handleToggle('allowPasswordReset')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyIcon className="h-5 w-5" />
            <span>Password Policy</span>
          </CardTitle>
          <CardDescription>
            Set password requirements for team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Minimum Password Length</Label>
            <Select 
              value={settings.passwordMinLength.toString()} 
              onValueChange={(value) => handleSelectChange('passwordMinLength', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 characters</SelectItem>
                <SelectItem value="8">8 characters</SelectItem>
                <SelectItem value="10">10 characters</SelectItem>
                <SelectItem value="12">12 characters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Password Requirements</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.passwordRequireUppercase ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Require uppercase letters</span>
                </div>
                <Switch
                  checked={settings.passwordRequireUppercase}
                  onCheckedChange={() => handleToggle('passwordRequireUppercase')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.passwordRequireNumbers ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Require numbers</span>
                </div>
                <Switch
                  checked={settings.passwordRequireNumbers}
                  onCheckedChange={() => handleToggle('passwordRequireNumbers')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.passwordRequireSpecial ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Require special characters</span>
                </div>
                <Switch
                  checked={settings.passwordRequireSpecial}
                  onCheckedChange={() => handleToggle('passwordRequireSpecial')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Session Management</span>
          </CardTitle>
          <CardDescription>
            Control how long users stay logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select 
              value={settings.sessionTimeout.toString()} 
              onValueChange={(value) => handleSelectChange('sessionTimeout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
                <SelectItem value="720">30 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>
            Current security configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant={settings.requireTwoFactor ? "default" : "secondary"}>
                {settings.requireTwoFactor ? "Required" : "Optional"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Password Strength</span>
              <Badge variant="default">
                {settings.passwordRequireUppercase && settings.passwordRequireNumbers && settings.passwordRequireSpecial 
                  ? "Strong" : "Medium"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Duration</span>
              <Badge variant="outline">
                {settings.sessionTimeout === 1 ? "1 hour" :
                 settings.sessionTimeout === 24 ? "24 hours" :
                 settings.sessionTimeout === 168 ? "1 week" :
                 `${settings.sessionTimeout} hours`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}; 