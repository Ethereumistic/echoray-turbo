'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@repo/design-system/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { Separator } from '@repo/design-system/components/ui/separator';
import { cn } from '@repo/design-system/lib/utils';
import {
  BuildingIcon,
  UsersIcon,
  SettingsIcon,
  ChevronDownIcon,
  CrownIcon,
  HomeIcon,
  ShieldIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  ChevronsUpDownIcon,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
  _count: {
    members: number;
    departments: number;
  };
}

interface UserCompany {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  memberCount?: number;
  createdAt: string;
}

interface Permissions {
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  canManageMembers: boolean;
  canManageCompany: boolean;
  canViewMembers: boolean;
  canInviteMembers: boolean;
}

interface CompanyNavigationProps {
  company: Company;
  permissions: Permissions;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  requiresOwner?: boolean;
  requiresAdmin?: boolean;
}

export const CompanyNavigation = ({ company, permissions }: CompanyNavigationProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { getToken } = useAuth();
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const navigationItems: NavigationItem[] = [
    {
      label: 'Overview',
      href: `/${company.id}`,
      icon: HomeIcon,
      description: 'Company dashboard and overview',
    },
    {
      label: 'Members',
      href: `/${company.id}/members`,
      icon: UsersIcon,
      description: 'Manage team members and invitations',
    },
    {
      label: 'Departments',
      href: `/${company.id}/departments`,
      icon: Building2Icon,
      description: 'Organize teams into departments',
      requiresAdmin: true,
    },
    {
      label: 'Roles & Permissions',
      href: `/${company.id}/roles`,
      icon: ShieldIcon,
      description: 'Manage user roles and permissions',
      requiresAdmin: true,
    },
    {
      label: 'Settings',
      href: `/${company.id}/settings`,
      icon: SettingsIcon,
      description: 'Company settings and configuration',
      requiresOwner: true,
    },
  ];

  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.requiresOwner && !permissions.isOwner) return false;
    if (item.requiresAdmin && !permissions.isAdmin) return false;
    return true;
  });

  // Fetch user's companies for the combobox
  const fetchUserCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCompanies();
  }, [getToken]);

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.href === pathname);
    return currentItem?.label || 'Overview';
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleCompanySelect = (selectedCompany: UserCompany) => {
    const currentPage = getCurrentPageTitle();
    let targetPath = `/${selectedCompany.id}`;
    
    // Try to maintain the current page context when switching companies
    if (currentPage !== 'Overview') {
      const currentItem = navigationItems.find(item => item.label === currentPage);
      if (currentItem) {
        // Check if user has permission for this page in the new company
        const hasPermission = 
          !currentItem.requiresOwner || selectedCompany.isOwner ||
          !currentItem.requiresAdmin || selectedCompany.isAdmin;
        
        if (hasPermission) {
          targetPath = currentItem.href.replace(company.id, selectedCompany.id);
        }
      }
    }
    
    router.push(targetPath);
    setOpen(false);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center  gap-4">
        {/* Breadcrumbs - Most Left */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Companies</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company.id}`}>{company.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getCurrentPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Separator orientation="vertical" className="h-8" />

        {/* Company Selector Combobox */}
        <div className="mx-auto">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              className="flex items-center space-x-2 h-auto p-2 min-w-0"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`}
                  alt={company.name}
                />
                <AvatarFallback className="text-xs">
                  {getCompanyInitials(company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <div className="flex items-center space-x-1 w-full">
                  <span className="text-sm font-medium truncate">{company.name}</span>
                  {permissions.isOwner && (
                    <CrownIcon className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  )}
                  {permissions.isAdmin && !permissions.isOwner && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
                      Admin
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {company._count.members + 1} members • {company._count.departments} departments
                </span>
              </div>
              <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search companies..." />
              <CommandList>
                <CommandEmpty>
                  {companiesLoading ? "Loading companies..." : "No companies found."}
                </CommandEmpty>
                <CommandGroup heading="Your Companies">
                  {userCompanies.map((userCompany) => (
                    <CommandItem
                      key={userCompany.id}
                      value={`${userCompany.name} ${userCompany.description || ''}`}
                      onSelect={() => handleCompanySelect(userCompany)}
                      className="flex items-center space-x-3 p-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${userCompany.name}`}
                          alt={userCompany.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getCompanyInitials(userCompany.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium truncate">
                            {userCompany.name}
                          </span>
                          {userCompany.isOwner && (
                            <CrownIcon className="h-3 w-3 text-yellow-500" />
                          )}
                          {userCompany.isAdmin && !userCompany.isOwner && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>
                        {userCompany.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {userCompany.description}
                          </span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {userCompany.memberCount} members
                        </div>
                      </div>
                      {company.id === userCompany.id && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        </div>

        {/* Navigation Menu - Right Side */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BuildingIcon className="h-4 w-4 mr-2" />
                Manage
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {filteredNavigationItems.map((item, index) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "flex items-center space-x-3 p-3",
                    pathname === item.href && "bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};