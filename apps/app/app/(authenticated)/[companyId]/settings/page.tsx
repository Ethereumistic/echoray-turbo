import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { SettingsLayout } from './components/settings-layout';
import { GeneralSettings } from './components/general-settings';
import { SecuritySettings } from './components/security-settings';
import { MemberAccessSettings } from './components/member-access-settings';
import { IntegrationSettings } from './components/integration-settings';
import { BillingSettings } from './components/billing-settings';
import { AdvancedSettings } from './components/advanced-settings';

interface CompanySettingsPageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const CompanySettingsPage = async ({ params, searchParams }: CompanySettingsPageProps) => {
  const { userId } = await auth();
  const { companyId } = await params;
  const { tab = 'general' } = await searchParams;
  const db = database as any;

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch company with detailed settings information
  const company = await db.company.findFirst({
    where: {
      id: companyId,
      ownerId: userId, // Only owners can access settings
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
      },
      _count: {
        select: {
          members: true,
          departments: true,
          invitations: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Calculate company statistics for settings context
  const companyStats = {
    totalMembers: company.members.length + 1, // +1 for owner
    activeDepartments: company.departments.length,
    pendingInvitations: company.invitations.length,
    createdAt: company.createdAt,
    lastUpdated: company.updatedAt,
  };

  // Settings tabs configuration with owner-only access
  const settingsTabs = [
    {
      id: 'general',
      label: 'General',
      description: 'Company profile and basic information',
      component: <GeneralSettings company={company} stats={companyStats} />,
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Security policies and authentication settings',
      component: <SecuritySettings company={company} />,
    },
    {
      id: 'members',
      label: 'Members & Access',
      description: 'Default permissions and member settings',
      component: <MemberAccessSettings company={company} stats={companyStats} />,
    },
    {
      id: 'integrations',
      label: 'Integrations',
      description: 'API keys, webhooks, and connected services',
      component: <IntegrationSettings company={company} />,
    },
    {
      id: 'billing',
      label: 'Billing',
      description: 'Subscription, usage, and payment settings',
      component: <BillingSettings company={company} stats={companyStats} />,
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Data management and danger zone',
      component: <AdvancedSettings company={company} />,
    },
  ];

  const currentTab = settingsTabs.find(t => t.id === tab) || settingsTabs[0];

  return (
    <div className=" mx-auto p-6">
      <div className="">
        {/* Settings Header */}


        {/* Settings Layout with Sidebar Navigation */}
        <SettingsLayout
          tabs={settingsTabs}
          currentTab={currentTab}
          companyId={companyId}
        />
      </div>
    </div>
  );
};

export default CompanySettingsPage; 