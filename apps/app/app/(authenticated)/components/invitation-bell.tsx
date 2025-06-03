'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Badge } from '@repo/design-system/components/ui/badge';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { cn } from '@repo/design-system/lib/utils';
import {
  BellIcon,
  MailIcon,
  CheckIcon,
  XIcon,
  LoaderIcon,
  InboxIcon,
} from 'lucide-react';
import { useCompany } from '../hooks/use-company';

interface Invitation {
  id: string;
  companyId: string;
  companyName: string;
  companyDescription?: string;
  invitedBy: string;
  invitedByName: string;
  role: string;
  isAdmin: boolean;
  message?: string;
  invitedAt: string;
  expiresAt: string;
}

interface InvitationBellProps {
  className?: string;
}

export const InvitationBell = ({ className }: InvitationBellProps) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { refetch } = useCompany();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch pending invitations
  const fetchInvitations = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/invitations/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      } else {
        console.error('Failed to fetch invitations:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      fetchInvitations();
      
      // Refresh every 30 seconds when component is mounted
      const interval = setInterval(fetchInvitations, 30000);
      return () => clearInterval(interval);
    }
  }, [user, getToken]);

  // Handle invitation response
  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingId(invitationId);
      const token = await getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/invitations/${invitationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        // Remove invitation from list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        
        // If accepted, refresh companies to show the new company
        if (action === 'accept') {
          await refetch();
        }
        
        // Show success message (you can add toast notification here)
        console.log(`✅ Invitation ${action}ed successfully`);
      } else {
        console.error(`Failed to ${action} invitation:`, response.statusText);
      }
    } catch (error) {
      console.error(`Failed to ${action} invitation:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const hasNotifications = invitations.length > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-8 w-8 rounded-full',
            'hover:bg-accent hover:text-accent-foreground',
            className
          )}
        >
          <BellIcon className="h-4 w-4" />
          {hasNotifications && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {invitations.length > 9 ? '9+' : invitations.length}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-4 w-4" />
            <span>Invitations</span>
          </div>
          {loading && <LoaderIcon className="h-4 w-4 animate-spin" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!hasNotifications ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <InboxIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No pending invitations</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-1 p-1">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Company and Inviter Info */}
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${invitation.companyName}`}
                          alt={invitation.companyName}
                        />
                        <AvatarFallback className="text-xs">
                          {getCompanyInitials(invitation.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold truncate">
                            {invitation.companyName}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {invitation.role}
                          </Badge>
                          {invitation.isAdmin && (
                            <Badge variant="outline" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Invited by {invitation.invitedByName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(invitation.invitedAt)}
                        </p>
                        {invitation.companyDescription && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {invitation.companyDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {invitation.message && (
                      <div className="bg-muted/50 p-2 rounded text-xs">
                        <MailIcon className="h-3 w-3 inline mr-1" />
                        {invitation.message}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                        disabled={processingId === invitation.id}
                        className="flex-1 h-8"
                      >
                        {processingId === invitation.id ? (
                          <LoaderIcon className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckIcon className="h-3 w-3 mr-1" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                        disabled={processingId === invitation.id}
                        className="flex-1 h-8"
                      >
                        <XIcon className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {hasNotifications && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchInvitations}
                disabled={loading}
                className="w-full h-8 text-xs"
              >
                {loading ? (
                  <LoaderIcon className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 