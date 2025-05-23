"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthCallback() {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState('Initializing authentication...');
  const [messageSent, setMessageSent] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug logging function that also logs to window console
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🔧 AUTH CALLBACK:', logMessage);
    window.console?.log('🔧 AUTH CALLBACK:', logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  };

  // Add global error handler to catch any issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addDebugLog(`❌ JavaScript Error: ${event.error?.message || event.message}`);
      console.error('Auth callback error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addDebugLog(`❌ Unhandled Promise Rejection: ${event.reason}`);
      console.error('Auth callback unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    addDebugLog('🚀 AuthCallback component mounted');
    addDebugLog(`🌐 URL: ${window.location.href}`);
    addDebugLog(`🔐 Auth Status - isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}, userId: ${userId || 'none'}`);
    
    // Also log to window title for easy debugging
    document.title = `Auth Callback - ${isLoaded ? (isSignedIn ? 'Signed In' : 'Not Signed In') : 'Loading'}`;
    
    // Extract query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const callbackType = urlParams.get('callback');
    addDebugLog(`📋 Callback type: ${callbackType}`);
    
    if (callbackType !== 'survey') {
      const errorMsg = '❌ Invalid callback type - expected "survey"';
      addDebugLog(errorMsg);
      setStatus(errorMsg);
      return;
    }
    
    // Check for parent window immediately
    const opener = window.opener;
    addDebugLog(`🪟 Parent window: ${opener ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Try to send a basic "alive" message immediately
    if (opener) {
      try {
        addDebugLog('📡 Sending "alive" message to parent');
        opener.postMessage({
          type: "AUTH_CALLBACK_ALIVE",
          url: window.location.href,
          timestamp: Date.now()
        }, "*");
      } catch (messageError) {
        addDebugLog(`❌ Failed to send alive message: ${messageError}`);
      }
    }
    
    // Only proceed when auth is loaded
    if (!isLoaded) {
      const loadingMsg = '⏳ Waiting for auth to load...';
      addDebugLog(loadingMsg);
      setStatus(loadingMsg);
      return;
    }
    
    addDebugLog(`✅ Auth loaded - isSignedIn: ${isSignedIn}, userId: ${userId || 'none'}`);
    
    if (!isSignedIn || !userId) {
      const notSignedInMsg = '🚫 User is not signed in. Please sign in or sign up.';
      addDebugLog(notSignedInMsg);
      setStatus(notSignedInMsg);
      
      // Try to redirect to sign-in if not signed in
      if (!isSignedIn) {
        addDebugLog('🔄 Attempting to redirect to sign-in...');
        setTimeout(() => {
          window.location.href = '/sign-in?callback=survey';
        }, 2000);
      }
      return;
    }
    
    // Prevent sending multiple messages
    if (messageSent) {
      addDebugLog('✋ Message already sent, skipping');
      return;
    }
    
    addDebugLog('🎯 Preparing to send auth data');
    
    const sendAuthData = async () => {
      try {
        addDebugLog(`🔑 Starting auth data send process for userId: ${userId}`);
        
        // Get the session token for cross-domain authentication
        addDebugLog('🎫 Attempting to get session token...');
        let sessionToken = null;
        try {
          sessionToken = await getToken();
          addDebugLog(`🎫 Session token: ${sessionToken ? 'SUCCESS' : 'FAILED'}`);
        } catch (tokenError) {
          addDebugLog(`❌ Session token error: ${tokenError}`);
        }
        
        const authData = {
          type: "SURVEY_AUTH_COMPLETE",
          userId: userId,
          sessionToken: sessionToken,
          isSignedIn: true,
          timestamp: Date.now()
        };
        
        addDebugLog(`📤 Sending message to parent window: ${JSON.stringify(authData)}`);
        
        if (!opener) {
          addDebugLog('❌ No parent window available');
          setStatus('Error: Parent window not found');
          return;
        }
        
        // Send message to parent window with the user ID and session token
        opener.postMessage(authData, "*");
        addDebugLog('✅ Message sent via postMessage');
        
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
          addDebugLog('💾 Auth data stored in localStorage as backup');
        } catch (storageError) {
          addDebugLog(`❌ localStorage error: ${storageError}`);
        }
        
        setMessageSent(true);
        const successMsg = '🎉 Authentication complete! Returning to survey...';
        addDebugLog(successMsg);
        setStatus(successMsg);
        document.title = 'Auth Complete - Closing...';
        
        // Send multiple messages to ensure delivery
        const sendBackupMessages = () => {
          for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
              if (opener && !opener.closed) {
                addDebugLog(`📤 Sending backup message #${i}`);
                opener.postMessage(authData, "*");
              }
            }, i * 500);
          }
        };
        
        sendBackupMessages();
        
        // Close this window after a delay
        setTimeout(() => {
          addDebugLog('🔚 Attempting to close auth window');
          try {
            window.close();
          } catch (closeError) {
            addDebugLog(`❌ Failed to close window: ${closeError}`);
          }
        }, 3000);
        
      } catch (error) {
        const errorMsg = `❌ Error in sendAuthData: ${error}`;
        addDebugLog(errorMsg);
        console.error(errorMsg, error);
        setStatus('Error completing authentication. Please try again.');
        document.title = 'Auth Error';
      }
    };
    
    sendAuthData();
  }, [isLoaded, isSignedIn, userId, getToken, messageSent]);

  // Also try to send auth data periodically if we have the required data
  useEffect(() => {
    if (isLoaded && isSignedIn && userId && !messageSent) {
      addDebugLog('⏰ Setting up periodic auth check...');
      
      const interval = setInterval(() => {
        if (window.opener && !messageSent) {
          addDebugLog('⏰ Periodic auth check - attempting to send message');
          
          const quickAuthData = {
            type: "SURVEY_AUTH_COMPLETE",
            userId: userId,
            isSignedIn: true,
            sessionToken: null,
            source: 'periodic-check',
            timestamp: Date.now()
          };
          
          try {
            window.opener.postMessage(quickAuthData, "*");
            addDebugLog('📤 Periodic message sent');
          } catch (periodicError) {
            addDebugLog(`❌ Periodic message failed: ${periodicError}`);
          }
          
          // Try to get token asynchronously
          getToken().then((token: string | null) => {
            if (token && window.opener && !messageSent) {
              const fullAuthData = {
                type: "SURVEY_AUTH_COMPLETE",
                userId: userId,
                sessionToken: token,
                isSignedIn: true,
                source: 'periodic-with-token',
                timestamp: Date.now()
              };
              
              try {
                window.opener.postMessage(fullAuthData, "*");
                addDebugLog('📤 Periodic message with token sent');
              } catch (tokenMsgError) {
                addDebugLog(`❌ Token message failed: ${tokenMsgError}`);
              }
            }
          }).catch((tokenError: unknown) => {
            addDebugLog(`❌ Error getting token in periodic check: ${tokenError}`);
          });
        }
      }, 1000);
      
      // Clear interval after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        addDebugLog('⏰ Cleared periodic auth check interval');
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
      
      {/* Always show debug information for troubleshooting */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-left text-xs max-w-2xl max-h-64 overflow-y-auto">
        <h3 className="font-bold mb-2">Debug Logs:</h3>
        {debugLogs.map((log, index) => (
          <div key={index} className="mb-1 font-mono text-xs">
            {log}
          </div>
        ))}
      </div>
      
      {/* Add manual controls for testing */}
      <div className="mt-4 space-x-2">
        <button 
          onClick={() => {
            if (window.opener) {
              const testMessage = {
                type: "SURVEY_AUTH_COMPLETE",
                userId: userId || 'test-user',
                isSignedIn: true,
                source: 'manual-test',
                timestamp: Date.now()
              };
              window.opener.postMessage(testMessage, "*");
              addDebugLog('📤 Manual test message sent');
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Send Test Message
        </button>
        
        <button 
          onClick={() => {
            window.close();
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Close Window
        </button>
      </div>
    </div>
  );
} 