'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

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

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider = ({ children }: CompanyProviderProps) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Get the session token for authentication
      const token = await getToken();
      
      // Fetch companies from the API
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
        const fetchedCompanies = data.companies || [];
        setCompanies(fetchedCompanies);
        
        // Set initial selected company if none is selected
        if (!selectedCompany && fetchedCompanies.length > 0) {
          // Try to get from localStorage first
          const savedCompanyId = localStorage.getItem('selectedCompanyId');
          const savedCompany = savedCompanyId 
            ? fetchedCompanies.find((c: Company) => c.id === savedCompanyId)
            : null;
          
          setSelectedCompany(savedCompany || fetchedCompanies[0]);
        }
      } else {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      setCompanies([]);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSelectedCompany = (company: Company | null) => {
    setSelectedCompany(company);
    // Save to localStorage
    if (company) {
      localStorage.setItem('selectedCompanyId', company.id);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchCompanies();
    }
  }, [user, isLoaded]);

  const value: CompanyContextType = {
    companies,
    selectedCompany,
    setSelectedCompany: handleSetSelectedCompany,
    isLoading,
    error,
    refetch: fetchCompanies,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}; 