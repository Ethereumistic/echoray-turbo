import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { CompanyNavigation } from './components/company-navigation';

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{ companyId: string }>;
}

const CompanyLayout = async ({ children, params }: CompanyLayoutProps) => {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { companyId } = await params;
  const db = database as any;

  // Check if user has access to this company
  const company = await db.company.findFirst({
    where: {
      id: companyId,
      OR: [
        // User is the owner
        { ownerId: userId },
        // User is a member
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
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        where: {
          userId: userId,
          status: 'ACTIVE',
        },
        select: {
          isAdmin: true,
          joinedAt: true,
        },
      },
      _count: {
        select: {
          members: true,
          departments: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Determine user's role in the company
  const isOwner = company.ownerId === userId;
  const membership = company.members[0];
  const isAdmin = isOwner || (membership?.isAdmin ?? false);
  const isMember = !!membership || isOwner;

  const userPermissions = {
    isOwner,
    isAdmin,
    isMember,
    canManageMembers: isOwner || isAdmin,
    canManageCompany: isOwner,
    canViewMembers: isMember,
    canInviteMembers: isOwner || isAdmin,
  };

  return (
    <div className="flex flex-col h-full">
      <CompanyNavigation 
        company={company}
        permissions={userPermissions}
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default CompanyLayout; 