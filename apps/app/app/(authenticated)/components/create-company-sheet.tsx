'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { cn } from '@repo/design-system/lib/utils';
import {
  PlusIcon,
  BuildingIcon,
  XIcon,
  MailIcon,
  UserPlusIcon,
  LoaderIcon,
} from 'lucide-react';
import { useCompany } from '../hooks/use-company';

interface Invitation {
  email: string;
  role: 'MEMBER' | 'ADMIN' | 'MANAGER';
  isAdmin: boolean;
}

interface CreateCompanySheetProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const CreateCompanySheet = ({ trigger, className }: CreateCompanySheetProps) => {
  const { getToken } = useAuth();
  const { refetch } = useCompany();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN' | 'MANAGER'>('MEMBER');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInvitation = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    
    // Check if email already exists in invitations
    if (invitations.some(inv => inv.email === inviteEmail)) return;
    
    setInvitations(prev => [...prev, {
      email: inviteEmail,
      role: inviteRole,
      isAdmin: inviteIsAdmin,
    }]);
    
    // Reset invite form
    setInviteEmail('');
    setInviteRole('MEMBER');
    setInviteIsAdmin(false);
  };

  const removeInvitation = (email: string) => {
    setInvitations(prev => prev.filter(inv => inv.email !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      
      // Create company
      const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      if (!companyResponse.ok) {
        throw new Error('Failed to create company');
      }

      const { company } = await companyResponse.json();
      
      // Send invitations if any
      if (invitations.length > 0) {
        const invitePromises = invitations.map(invitation =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/companies/${company.id}/invitations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              email: invitation.email,
              role: invitation.role,
              isAdmin: invitation.isAdmin,
              message: `You've been invited to join ${company.name}!`,
            }),
          })
        );
        
        await Promise.all(invitePromises);
      }
      
      // Reset form and close sheet
      setFormData({ name: '', description: '' });
      setInvitations([]);
      setOpen(false);
      
      // Refresh companies list
      await refetch();
      
    } catch (error) {
      console.error('Error creating company:', error);
      // TODO: Add toast notification for error
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <PlusIcon className="h-4 w-4 mr-2" />
      Create Company
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <BuildingIcon className="h-5 w-5" />
            <span>Create New Company</span>
          </SheetTitle>
          <SheetDescription>
            Create a new company and invite team members to join.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Company Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                type="text"
                placeholder="EchoRay Technologies"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-description">Description</Label>
              <Textarea
                id="company-description"
                placeholder="Brief description of your company..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Invite Team Members */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <UserPlusIcon className="h-4 w-4" />
                <span>Invite Team Members</span>
              </Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInvitation())}
                  />
                </div>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={addInvitation}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Invitation List */}
            {invitations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Pending Invitations</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {invitations.map((invitation, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <MailIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm truncate">{invitation.email}</span>
                        <Badge variant="secondary" className="text-xs">
                          {invitation.role}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvitation(invitation.email)}
                        className="h-6 w-6 p-0"
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BuildingIcon className="h-4 w-4 mr-2" />
                  Create Company
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}; 