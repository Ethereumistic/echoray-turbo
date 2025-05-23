"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthCallback() {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState('Initializing authentication...');
  const [messageSent, setMessageSent] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    addDebugLog('AuthCallback component mounted');
    addDebugLog(`URL: ${window.location.href}`);
    addDebugLog(`isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}, userId: ${userId}`);
    
    // Extract any query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const callbackType = urlParams.get('callback');
    addDebugLog(`Callback type: ${callbackType}`);
    
    if (callbackType !== 'survey') {
      const errorMsg = 'Invalid callback type - expected "survey"';
      addDebugLog(errorMsg);
      setStatus(errorMsg);
      return;
    }
    
    // Only proceed when auth is loaded
    if (!isLoaded) {
      const loadingMsg = 'Waiting for auth to load...';
      addDebugLog(loadingMsg);
      setStatus(loadingMsg);
      return;
    }
    
    addDebugLog(`Auth loaded - isSignedIn: ${isSignedIn}, userId: ${userId}`);
    
    if (!isSignedIn || !userId) {
      const notSignedInMsg = 'User is not signed in. Please sign in or sign up.';
      addDebugLog(notSignedInMsg);
      setStatus(notSignedInMsg);
      return;
    }
    
    // Prevent sending multiple messages
    if (messageSent) {
      addDebugLog('Message already sent, skipping');
      return;
    }
    
    // Get opener (parent window)
    const opener = window.opener;
    if (!opener) {
      const noOpenerMsg = 'Parent window not found. Please try again.';
      addDebugLog(noOpenerMsg);
      setStatus(noOpenerMsg);
      return;
    }
    
    addDebugLog('Parent window found, preparing to send auth data');
    
    const sendAuthData = async () => {
      try {
        addDebugLog(`Starting auth data send process for userId: ${userId}`);
        
        // Get the session token for cross-domain authentication
        addDebugLog('Attempting to get session token...');
        const sessionToken = await getToken();
        addDebugLog(`Session token retrieved: ${sessionToken ? 'SUCCESS' : 'FAILED'}`);
        
        const authData = {
          type: "SURVEY_AUTH_COMPLETE",
          userId: userId,
          sessionToken: sessionToken,
          isSignedIn: true
        };
        
        addDebugLog(`Sending message to parent window: ${JSON.stringify(authData)}`);
        
        // Send message to parent window with the user ID and session token
        opener.postMessage(authData, "*"); // This should ideally be the specific origin
        
        addDebugLog('Message sent via postMessage');
        
        // Also store in localStorage as backup
        try {
          const backupData = {
            source: 'echoray-auth-callback',
            type: 'SURVEY_AUTH_COMPLETE',
            userId: userId,
            sessionToken: sessionToken,
            timestamp: Date.now()
          };
          
          localStorage.setItem('echoray-auth-data', JSON.stringify(backupData));
          addDebugLog('Auth data stored in localStorage as backup');
        } catch (e) {
          addDebugLog(`Could not store auth data in localStorage: ${e}`);
        }
        
        setMessageSent(true);
        const successMsg = 'Authentication complete! Returning to survey...';
        addDebugLog(successMsg);
        setStatus(successMsg);
        
        // Try to send the message multiple times to ensure delivery
        setTimeout(() => {
          addDebugLog('Sending duplicate message after 500ms');
          opener.postMessage(authData, "*");
        }, 500);
        
        setTimeout(() => {
          addDebugLog('Sending duplicate message after 1000ms');
          opener.postMessage(authData, "*");
        }, 1000);
        
        // Close this window after a delay
        setTimeout(() => {
          addDebugLog('Attempting to close auth window');
          window.close();
        }, 2000);
      } catch (error) {
        const errorMsg = `Error getting session token or sending message: ${error}`;
        addDebugLog(errorMsg);
        console.error(errorMsg, error);
        setStatus('Error completing authentication. Please try again.');
      }
    };
    
    sendAuthData();
  }, [isLoaded, isSignedIn, userId, getToken, messageSent]);

  // Also try to send auth data periodically if we have the required data
  useEffect(() => {
    if (isLoaded && isSignedIn && userId && !messageSent) {
      addDebugLog('Setting up periodic auth check...');
      
      const interval = setInterval(() => {
        if (window.opener && !messageSent) {
          addDebugLog('Periodic auth check - attempting to send message');
          
          const quickAuthData = {
            type: "SURVEY_AUTH_COMPLETE",
            userId: userId,
            isSignedIn: true,
            sessionToken: null // We'll get this separately
          };
          
          window.opener.postMessage(quickAuthData, "*");
          
          // Try to get token asynchronously
          getToken().then((token: string | null) => {
            if (token) {
              const fullAuthData = {
                type: "SURVEY_AUTH_COMPLETE",
                userId: userId,
                sessionToken: token,
                isSignedIn: true
              };
              
              if (window.opener) {
                window.opener.postMessage(fullAuthData, "*");
                addDebugLog('Sent full auth data with session token');
              }
            }
          }).catch((tokenError: unknown) => {
            addDebugLog(`Error getting token in periodic check: ${tokenError}`);
          });
        }
      }, 1000);
      
      // Clear interval after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        addDebugLog('Cleared periodic auth check interval');
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isLoaded, isSignedIn, userId, getToken, messageSent]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Callback</h1>
      <p className="mb-4">{status}</p>
      <p className="text-sm text-muted-foreground mb-4">
        This window will close automatically if authentication is successful.
      </p>
      
      {/* Debug information - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-left text-xs max-w-2xl max-h-64 overflow-y-auto">
          <h3 className="font-bold mb-2">Debug Logs:</h3>
          {debugLogs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 