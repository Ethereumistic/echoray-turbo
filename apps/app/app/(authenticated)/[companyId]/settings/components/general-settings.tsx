'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
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
  CalendarIcon,
  UsersIcon,
  Building2Icon,
  MailIcon,
  LoaderIcon,
  SaveIcon,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
}

interface CompanyStats {
  totalMembers: number;
  activeDepartments: number;
  pendingInvitations: number;
  createdAt: string;
  lastUpdated: string;
}

interface GeneralSettingsProps {
  company: Company;
  stats: CompanyStats;
}

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export const GeneralSettings = ({ company, stats }: GeneralSettingsProps) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    description: company.description || '',
    timezone: 'UTC', // Default, would come from company settings
    dateFormat: 'MM/DD/YYYY', // Default, would come from company settings
    language: 'en', // Default, would come from company settings
  });

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/companies/${company.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          settings: {
            timezone: formData.timezone,
            dateFormat: formData.dateFormat,
            language: formData.language,
          },
        }),
      });

      if (response.ok) {
        // Show success message or refresh page
        window.location.reload();
      } else {
        console.error('Failed to update company settings');
      }
    } catch (error) {
      console.error('Error updating company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = 
    formData.name !== company.name ||
    formData.description !== (company.description || '');

  return (
    <div className="space-y-6">
      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Update your company's basic information and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Avatar & Name */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`}
                alt={formData.name}
              />
              <AvatarFallback className="text-lg">
                {getCompanyInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 256x256px
              </p>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          {/* Company Description */}
          <div className="space-y-2">
            <Label htmlFor="company-description">Description</Label>
            <Textarea
              id="company-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your company does..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be visible to team members and in invitations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Set default preferences for your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div className="space-y-2">
            <Label>Default Timezone</Label>
            <Select 
              value={formData.timezone} 
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select 
              value={formData.dateFormat} 
              onValueChange={(value) => handleInputChange('dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Company Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
          <CardDescription>
            Key information about your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <div className="text-xs text-muted-foreground">Total Members</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <Building2Icon className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.activeDepartments}</div>
                <div className="text-xs text-muted-foreground">Departments</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <MailIcon className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
                <div className="text-xs text-muted-foreground">Pending Invites</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <CalendarIcon className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-sm font-bold">
                  {formatDate(stats.createdAt).split(',')[0]}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Owner:</span>
              <span className="text-sm font-medium">
                {company.owner.name || company.owner.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm">{formatDate(company.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-sm">{formatDate(company.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}; 