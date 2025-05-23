'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const [status, setStatus] = useState<'signing-out' | 'success' | 'error'>('signing-out');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log('🚪 Starting Clerk sign out process...');
        setStatus('signing-out');
        
        // Sign out from Clerk
        await signOut();
        
        console.log('✅ Successfully signed out from Clerk');
        setStatus('success');
        
        // Notify parent window (the web app) that sign out was successful
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'CLERK_SIGNOUT_SUCCESS',
            message: 'User signed out successfully'
          }, '*');
          console.log('📤 Notified parent window of successful sign out');
        }
        
        // Close this popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
        
      } catch (error) {
        console.error('🚨 Error during sign out:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setStatus('error');
        
        // Notify parent window of the error
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'CLERK_SIGNOUT_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, '*');
        }
      }
    };

    performSignOut();
  }, [signOut]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {status === 'signing-out' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚪</div>
            <h1 style={{ margin: '0 0 1rem 0', color: '#333' }}>Signing out...</h1>
            <p style={{ color: '#666' }}>Please wait while we sign you out.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ margin: '0 0 1rem 0', color: '#28a745' }}>Signed out successfully!</h1>
            <p style={{ color: '#666' }}>This window will close automatically.</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ margin: '0 0 1rem 0', color: '#dc3545' }}>Sign out failed</h1>
            <p style={{ color: '#666' }}>Error: {error}</p>
            <button 
              onClick={() => window.close()}
              style={{ 
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
} 