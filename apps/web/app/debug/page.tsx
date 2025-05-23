'use client';

import { env } from '@repo/env';
import { useState } from 'react';
import { useCrossDomainAuth } from '../hooks/use-cross-domain-auth';

export default function DebugPage() {
  const { authenticated, user, loading, error, debug, signOut, recheckAuth } = useCrossDomainAuth();
  const [manualTestResult, setManualTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const testAuthEndpoint = async () => {
    setTesting(true);
    try {
      console.log('🧪 Manual test starting...');
      const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🧪 Manual test response:', response);
      const data = await response.json();
      console.log('🧪 Manual test data:', data);
      
      setManualTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      });
    } catch (error) {
      console.error('🧪 Manual test error:', error);
      setManualTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const testSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out test failed:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Cross-Domain Auth Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Environment Info</h2>
        <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        <p><strong>App URL:</strong> {env.NEXT_PUBLIC_APP_URL}</p>
        <p><strong>Auth Endpoint:</strong> {env.NEXT_PUBLIC_APP_URL}/api/auth/check</p>
        <p><strong>Sign Out Endpoint:</strong> {env.NEXT_PUBLIC_APP_URL}/api/auth/signout</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Hook Auth Status</h2>
        <p><strong>Loading:</strong> {loading ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Authenticated:</strong> {authenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Debug:</strong> {debug || 'None'}</p>
        {user && (
          <div>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Manual Test</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={testAuthEndpoint} 
            disabled={testing}
            style={{ padding: '10px 20px', fontSize: '16px' }}
          >
            {testing ? 'Testing...' : 'Test Auth Endpoint'}
          </button>
          
          {authenticated && (
            <button 
              onClick={testSignOut} 
              disabled={signingOut}
              style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#dc3545', color: 'white' }}
            >
              {signingOut ? 'Signing Out...' : 'Test Sign Out'}
            </button>
          )}
          
          <button 
            onClick={recheckAuth} 
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#28a745', color: 'white' }}
          >
            {loading ? 'Checking...' : 'Recheck Auth'}
          </button>
        </div>
        
        {manualTestResult && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
            <h3>Manual Test Result:</h3>
            <pre>{JSON.stringify(manualTestResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Available Debug Commands</h2>
        <p>Open browser console and try:</p>
        <ul>
          <li><code>window.authDebug</code> - Check current auth status</li>
          <li><code>window.authDebug.recheckAuth()</code> - Recheck authentication</li>
          <li><code>window.authDebug.signOut()</code> - Sign out user</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Quick Actions</h2>
        <p>
          {!authenticated ? (
            <>
              <a 
                href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none' }}
              >
                Sign In (opens in new tab)
              </a>
              <a 
                href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}
              >
                Sign Up (opens in new tab)
              </a>
            </>
          ) : (
            <a 
              href={`${env.NEXT_PUBLIC_APP_URL}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}
            >
              Go to Dashboard (opens in new tab)
            </a>
          )}
        </p>
      </div>

      {/* Status indicator */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        padding: '10px', 
        backgroundColor: authenticated ? '#d4edda' : '#f8d7da',
        border: `1px solid ${authenticated ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '4px',
        fontWeight: 'bold'
      }}>
        {loading ? '🔄 Loading...' : authenticated ? `✅ Signed in as ${user?.firstName || 'User'}` : '❌ Not signed in'}
      </div>
    </div>
  );
} 