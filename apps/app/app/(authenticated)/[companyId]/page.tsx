import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import {
  UsersIcon,
  Building2Icon,
  CalendarIcon,
  TrendingUpIcon,
  MailIcon,
  CrownIcon,
} from 'lucide-react';
import { UserSyncButton } from './components/UserSyncButton';

interface CompanyPageProps {
  params: Promise<{ companyId: string }>;
}

const CompanyPage = async ({ params }: CompanyPageProps) => {
  const { userId } = await auth();
  const { companyId } = await params;
  const db = database as any;

  // Fetch detailed company information
  const company = await db.company.findFirst({
    where: {
      id: companyId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
              status: 'ACTIVE',
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      ownerId: true,
      settings: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      },
      departments: {
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
      invitations: {
        where: {
          status: 'PENDING',
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          invitedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          invitedAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Handle case where owner might not exist in database
  if (!company.owner) {
    // Try to sync the user from Clerk if they exist
    try {
      const { userId: currentUserId } = await auth();
      if (currentUserId === company.ownerId) {
        // Current user is the owner but not in database - redirect to trigger sync
        console.warn(`Owner user ${company.ownerId} not found in database for company ${company.id}`);
        // You might want to redirect to a sync page or handle this differently
      }
    } catch (error) {
      console.error('Error checking owner sync:', error);
    }
  }

  const isOwner = company.ownerId === userId;
  const userMembership = company.members.find((m: any) => m.user.id === userId);
  const isAdmin = isOwner || (userMembership?.isAdmin ?? false);

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
      month: 'short',
      day: 'numeric',
    });
  };

  const recentMembers = company.members.slice(0, 5);
  const totalMembers = company.members.length + 1; // +1 for owner
  const totalDepartments = company.departments.length;
  const pendingInvitations = company.invitations.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {company.members.length} active members + owner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <MailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription>
              Latest team members who joined the company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${company.owner?.name || company.owner?.email || 'Unknown'}`}
                    alt={company.owner?.name || company.owner?.email || 'Unknown Owner'}
                  />
                  <AvatarFallback>
                    {company.owner ? (company.owner.name || company.owner.email).charAt(0).toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {company.owner ? (company.owner.name || company.owner.email) : 'Owner (Not Synced)'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.owner ? company.owner.email : 'Owner user needs to be synced to database'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <CrownIcon className="h-4 w-4 text-yellow-500" />
                  <Badge variant="outline" className="text-xs">
                    Owner
                  </Badge>
                  {!company.owner && isOwner && (
                    <UserSyncButton />
                  )}
                </div>
              </div>

              {/* Recent Members */}
              {recentMembers.map((member: any) => (
                <div key={member.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name || member.user.email}`}
                      alt={member.user.name || member.user.email}
                    />
                    <AvatarFallback>
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </div>
                    {member.isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {company.members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members yet. Invite team members to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Recent invitations waiting for response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {company.invitations.map((invitation: any) => (
                <div key={invitation.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${invitation.email}`}
                      alt={invitation.email}
                    />
                    <AvatarFallback>
                      {invitation.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invitation.invitedBy.name || invitation.invitedBy.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(invitation.invitedAt)}
                    </div>
                  </div>
                </div>
              ))}

              {company.invitations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending invitations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyPage; 