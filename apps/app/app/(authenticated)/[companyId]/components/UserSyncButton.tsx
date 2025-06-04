"use client";

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserSyncButtonProps {
  className?: string;
}

export const UserSyncButton = ({ className }: UserSyncButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatus('success');
        // Refresh the page to show updated data
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Synced!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Retry Sync
        </>
      );
    }

    return (
      <>
        <RefreshCw className="mr-2 h-4 w-4" />
        Sync Account
      </>
    );
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || status === 'success'}
      variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'outline'}
      size="sm"
      className={className}
    >
      {getButtonContent()}
    </Button>
  );
}; 