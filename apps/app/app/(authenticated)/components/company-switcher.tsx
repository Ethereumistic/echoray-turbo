'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components/ui/avatar';
import { Badge } from '@repo/design-system/components/ui/badge';
import { cn } from '@repo/design-system/lib/utils';
import {
  BuildingIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  CrownIcon,
  UsersIcon,
} from 'lucide-react';
import { useCompany } from '../hooks/use-company';
import { CreateCompanySheet } from './create-company-sheet';

interface Company {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  memberCount?: number;
  createdAt: string;
}

interface CompanySwitcherProps {
  className?: string;
}

export const CompanySwitcher = ({ className }: CompanySwitcherProps) => {
  const { companies, selectedCompany, setSelectedCompany, isLoading, error } = useCompany();
  const router = useRouter();

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleManageCompany = (company: Company) => {
    router.push(`/${company.id}`);
  };

  const handleManageAllCompanies = () => {
    if (selectedCompany) {
      router.push(`/${selectedCompany.id}`);
    } else if (companies.length > 0) {
      router.push(`/${companies[0].id}`);
    } else {
      router.push('/');
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

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2 animate-pulse', className)}>
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center space-x-2 text-red-500', className)}>
        <span className="text-sm">Error loading companies</span>
      </div>
    );
  }

  if (!selectedCompany || companies.length === 0) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <CreateCompanySheet />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-2 py-1.5 h-auto',
            'hover:bg-accent hover:text-accent-foreground',
            className
          )}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedCompany.name}`}
                alt={selectedCompany.name}
              />
              <AvatarFallback className="text-xs">
                {getCompanyInitials(selectedCompany.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium truncate">
                  {selectedCompany.name}
                </span>
                {selectedCompany.isOwner && (
                  <CrownIcon className="h-3 w-3 text-yellow-500" />
                )}
                {selectedCompany.isAdmin && !selectedCompany.isOwner && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Admin
                  </Badge>
                )}
              </div>
              {selectedCompany.memberCount && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <UsersIcon className="h-3 w-3" />
                  <span>{selectedCompany.memberCount} members</span>
                </div>
              )}
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleCompanySelect(company)}
            className="flex items-center space-x-2 p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`}
                alt={company.name}
              />
              <AvatarFallback className="text-xs">
                {getCompanyInitials(company.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium truncate">
                  {company.name}
                </span>
                {company.isOwner && (
                  <CrownIcon className="h-3 w-3 text-yellow-500" />
                )}
                {company.isAdmin && !company.isOwner && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Admin
                  </Badge>
                )}
              </div>
              {company.description && (
                <span className="text-xs text-muted-foreground truncate">
                  {company.description}
                </span>
              )}
              {company.memberCount && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <UsersIcon className="h-3 w-3" />
                  <span>{company.memberCount} members</span>
                </div>
              )}
            </div>
            {selectedCompany?.id === company.id && (
              <CheckIcon className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <CreateCompanySheet
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center space-x-2 p-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create new company</span>
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem 
          onClick={handleManageAllCompanies}
          className="flex items-center space-x-2 p-2"
        >
          <BuildingIcon className="h-4 w-4" />
          <span>Manage companies</span>
        </DropdownMenuItem>
        
        {companies.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Quick Access
            </div>
            {companies.slice(0, 3).map((company) => (
              <DropdownMenuItem
                key={`manage-${company.id}`}
                onClick={() => handleManageCompany(company)}
                className="flex items-center space-x-2 p-2 pl-4"
              >
                <span className="text-xs">Manage {company.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 