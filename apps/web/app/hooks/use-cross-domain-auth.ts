'use client';

import { env } from '@repo/env';
import { useEffect, useState } from 'react';

interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  imageUrl: string;
}

interface AuthStatus {
  authenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  debug?: string;
}

interface AuthActions {
  signOut: () => Promise<void>;
  recheckAuth: () => void;
}

export const useCrossDomainAuth = (): AuthStatus & AuthActions => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  const checkAuth = async () => {
    try {
      console.log('🌐 Checking cross-domain auth status...');
      console.log('🎯 App URL:', env.NEXT_PUBLIC_APP_URL);
      console.log('🌍 Current origin:', window.location.origin);
      
      const authUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/check`;
      console.log('📍 Full auth URL:', authUrl);
      
      const response = await fetch(authUrl, {
        method: 'GET',
        credentials: 'include', // Important for cross-domain cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response status text:', response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.warn(`⚠️ Response not OK: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Response data:', data);

      setAuthStatus({
        authenticated: data.authenticated,
        user: data.user,
        loading: false,
        error: null,
        debug: data.debug,
      });

      // Success message
      if (data.authenticated) {
        console.log('🎉 User is authenticated!', data.user);
      } else {
        console.log('ℹ️ User is not authenticated');
      }

    } catch (error) {
      console.error('🚨 Error checking cross-domain auth:', error);
      
      setAuthStatus({
        authenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: `Failed to check auth: ${error}`,
      });
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Initiating cross-domain sign out...');
      setAuthStatus(prev => ({ ...prev, loading: true }));

      // Open the sign out page in a popup
      const signOutUrl = `${env.NEXT_PUBLIC_APP_URL}/signout`;
      console.log('📍 Opening sign out URL:', signOutUrl);
      
      const signOutWindow = window.open(
        signOutUrl, 
        'clerk-signout', 
        'width=500,height=400,scrollbars=yes,resizable=yes,left=' + 
        (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 200)
      );

      if (!signOutWindow) {
        throw new Error('Could not open sign out popup. Please allow popups for this site.');
      }

      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        // Only accept messages from our app domain
        const appOrigin = new URL(env.NEXT_PUBLIC_APP_URL).origin;
        if (event.origin !== appOrigin) {
          console.warn('🚨 Received message from untrusted origin:', event.origin);
          return;
        }

        console.log('📨 Received message from sign out popup:', event.data);

        if (event.data.type === 'CLERK_SIGNOUT_SUCCESS') {
          console.log('✅ Sign out successful!');
          
          // Remove the event listener
          window.removeEventListener('message', handleMessage);
          
          // Check auth status again to update UI
          setTimeout(() => {
            checkAuth();
          }, 500); // Small delay to ensure the session is fully cleared
          
        } else if (event.data.type === 'CLERK_SIGNOUT_ERROR') {
          console.error('🚨 Sign out failed:', event.data.error);
          
          // Remove the event listener
          window.removeEventListener('message', handleMessage);
          
          setAuthStatus(prev => ({
            ...prev,
            loading: false,
            error: `Sign out failed: ${event.data.error}`,
          }));
        }
      };

      // Add message listener
      window.addEventListener('message', handleMessage);

      // Set a timeout in case the popup doesn't respond
      setTimeout(() => {
        if (signOutWindow && !signOutWindow.closed) {
          console.warn('⚠️ Sign out popup timeout, closing...');
          signOutWindow.close();
        }
        window.removeEventListener('message', handleMessage);
        
        // Recheck auth status anyway
        checkAuth();
      }, 10000); // 10 second timeout

    } catch (error) {
      console.error('🚨 Error during sign out:', error);
      setAuthStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  };

  const recheckAuth = () => {
    setAuthStatus(prev => ({ ...prev, loading: true }));
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Expose debug info to global scope for easy debugging
  useEffect(() => {
    (window as any).authDebug = {
      ...authStatus,
      signOut,
      recheckAuth,
    };
  }, [authStatus]);

  return {
    ...authStatus,
    signOut,
    recheckAuth,
  };
}; 