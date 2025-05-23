"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { useEffect, useState, useRef } from "react"
import { env } from '@repo/env'
import { ArrowRight, ChevronLeft, UserPlus, ExternalLink, AlertCircle } from "lucide-react"

export function SignupPrompt({
  onComplete,
  onBack,
  isSubmitting = false
}: {
  onComplete: (userId: string) => void
  onBack: () => void
  isSubmitting?: boolean
}) {
  const [authCompleted, setAuthCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);
  const authWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const windowCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper function to log debug messages
  const logDebug = (msg: string) => {
    console.log(msg);
    setDebug(prev => [...prev, msg]);
  };
  
  // IMMEDIATE localStorage check on component mount
  useEffect(() => {
    logDebug('🔍 Component mounted - checking localStorage immediately...');
    try {
      const existingData = localStorage.getItem('echoray-auth-data');
      logDebug(`📦 Initial localStorage check: ${existingData ? 'FOUND DATA' : 'NO DATA'}`);
      if (existingData) {
        logDebug(`📦 Initial localStorage data: ${existingData}`);
      }
    } catch (e) {
      logDebug(`❌ Error in initial localStorage check: ${e}`);
    }
  }, []);
  
  // Function to fetch the current user after authentication
  const fetchCurrentUser = async (sessionToken?: string) => {
    try {
      logDebug('Fetching current user from API...');
      const baseUrl = env.NEXT_PUBLIC_API_URL || 'https://api.echoray.io';
      const apiUrl = baseUrl.endsWith('/') ? `${baseUrl}auth/check` : `${baseUrl}/auth/check`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add session token if available
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        logDebug('Using session token for authentication');
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include', // Important to include credentials for auth
      });
      
      const userData = await response.json();
      logDebug(`API response: ${JSON.stringify(userData)}`);
      
      if (!response.ok) {
        throw new Error(userData.error || 'Failed to fetch current user');
      }
      
      if (userData.isAuthenticated && userData.userId) {
        logDebug(`Current user fetched: ${userData.userId}`);
        setAuthCompleted(true);
        onComplete(userData.userId);
        return;
      }
      
      throw new Error('User is not authenticated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebug(`Error fetching current user: ${errorMessage}`);
      setError(`Authentication error: ${errorMessage}`);
    }
  };
  
  // Check URL params on load - user might be redirected here with auth info
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCompleted = params.get("auth");
    const timestamp = params.get("t");
    
    if (authCompleted === "success") {
      logDebug(`🔄 Detected auth redirect with timestamp: ${timestamp}`);
      
      // Check localStorage for auth data when redirected back
      setTimeout(() => {
        try {
          const authDataStr = localStorage.getItem('echoray-auth-data');
          if (authDataStr) {
            logDebug('📦 Found auth data in localStorage after redirect');
            const authData = JSON.parse(authDataStr);
            
            if (authData?.source === 'echoray-auth-callback' && 
                authData?.type === 'SURVEY_AUTH_COMPLETE' && 
                authData?.userId) {
              
              logDebug(`✅ Processing auth data from redirect: ${JSON.stringify(authData)}`);
              localStorage.removeItem('echoray-auth-data'); // Remove it once processed
              
              setAuthCompleted(true);
              
              // Store session token if available
              if (authData.sessionToken) {
                try {
                  sessionStorage.setItem('clerk-session-token', authData.sessionToken);
                  logDebug('✅ Stored session token from redirect auth data');
                } catch (e) {
                  logDebug('❌ Could not store session token in sessionStorage');
                }
              }
              
              // Try to close the auth window after successful processing
              try {
                if (authWindowRef.current && !authWindowRef.current.closed) {
                  logDebug('🔚 Closing auth window after successful authentication');
                  authWindowRef.current.close();
                }
              } catch (closeError) {
                logDebug(`⚠️ Could not close auth window: ${closeError}`);
              }
              
              onComplete(authData.userId);
              return;
            }
          }
        } catch (e) {
          logDebug(`❌ Error processing redirect auth data: ${e}`);
        }
        
        // If no localStorage data found, check if we have URL-based auth info
        const userId = params.get("userId");
        if (userId) {
          logDebug(`✅ Found userId in URL params: ${userId}`);
          setAuthCompleted(true);
          
          // Try to close the auth window
          try {
            if (authWindowRef.current && !authWindowRef.current.closed) {
              logDebug('🔚 Closing auth window after URL-based authentication');
              authWindowRef.current.close();
            }
          } catch (closeError) {
            logDebug(`⚠️ Could not close auth window: ${closeError}`);
          }
          
          onComplete(userId);
        }
      }, 500); // Small delay to ensure localStorage is updated
    }
  }, [onComplete]);
  
  // Handle message from auth window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      logDebug(`📨 Received message from ${event.origin}: ${JSON.stringify(event.data)}`);
      
      // Accept messages from any origin in development, but be more specific in production
      if (process.env.NODE_ENV === 'production' && 
          !event.origin.includes('echoray.io') && 
          !event.origin.includes('app.echoray.io') && 
          !event.origin.includes('api.echoray.io')) {
        logDebug(`🚫 Rejected message from unauthorized origin: ${event.origin}`);
        return;
      }
      
      // Filter out non-survey related messages
      if (!event.data || typeof event.data !== 'object') {
        return;
      }
      
      // Handle React DevTools and other irrelevant messages
      if (event.data.source === 'react-devtools-bridge' || 
          event.data.target === 'metamask-inpage' ||
          !event.data.type) {
        return;
      }
      
      logDebug(`🔍 Processing message of type: ${event.data.type}`);
      
      // Handle auth callback "alive" messages
      if (event.data.type === "AUTH_CALLBACK_ALIVE") {
        logDebug(`💓 Auth callback is alive at: ${event.data.url}`);
        return;
      }
      
      // Handle auth completion messages
      if (event.data?.type === "SURVEY_AUTH_COMPLETE" && event.data?.userId) {
        logDebug(`✅ Received auth completion from ${event.data.source || 'window'}: ${event.data.userId}`);
        setAuthCompleted(true);
        
        // Store session token if provided
        if (event.data.sessionToken) {
          logDebug('✅ Storing session token for API requests');
          try {
            // Store temporarily for use in API calls
            sessionStorage.setItem('clerk-session-token', event.data.sessionToken);
            logDebug('✅ Session token stored successfully');
          } catch (e) {
            logDebug('❌ Could not store session token in sessionStorage');
          }
        } else {
          logDebug('⚠️ No session token provided in auth completion message');
        }
        
        onComplete(event.data.userId);
      } else {
        logDebug(`❌ Invalid message - missing type or userId. Type: ${event.data?.type}, UserId: ${event.data?.userId}`);
      }
    };
    
    logDebug('📡 Setting up message event listener');
    window.addEventListener("message", handleMessage);
    return () => {
      logDebug('📡 Removing message event listener');
      window.removeEventListener("message", handleMessage);
    };
  }, [onComplete]);
  
  // Function to open sign-up/sign-in window
  const openAuthWindow = (type: 'sign-up' | 'sign-in') => {
    setError(null);
    
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // IMMEDIATE localStorage debugging
    logDebug('🔍 Checking localStorage immediately before opening auth window...');
    try {
      const existingData = localStorage.getItem('echoray-auth-data');
      logDebug(`📦 Existing localStorage data: ${existingData || 'NONE'}`);
    } catch (e) {
      logDebug(`❌ Error reading localStorage: ${e}`);
    }
    
    // Open auth page in a new window
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/${type}?callback=survey`;
    logDebug(`Opening ${type} window: ${url}`);
    
    try {
      // Before opening a new window, attempt to close any existing one
      try {
        if (authWindowRef.current) {
          authWindowRef.current.close();
        }
      } catch (e) {
        // Ignore errors - likely due to COOP
      }
      
      // Open the window with specific dimensions
      const newWindow = window.open(url, '_blank', 'width=500,height=600');
      
      if (!newWindow) {
        throw new Error('Failed to open authentication window. Please check your popup blocker settings.');
      }
      
      authWindowRef.current = newWindow;
      
      // Set up monitoring with AGGRESSIVE localStorage checking
      let authTimeElapsed = 0;
      let authSuccessful = false;
      
      // Set up a timeout to close the auth window after 60 seconds as a safety measure
      const windowCloseTimeout = setTimeout(() => {
        if (authWindowRef.current && !authWindowRef.current.closed && !authSuccessful) {
          logDebug('⏰ Auto-closing auth window after 60 seconds timeout');
          try {
            authWindowRef.current.close();
          } catch (e) {
            logDebug(`⚠️ Could not auto-close auth window: ${e}`);
          }
        }
      }, 60000); // 60 seconds
      
      // Store the timeout reference
      windowCloseTimeoutRef.current = windowCloseTimeout;
      
      const checkInterval = setInterval(async () => {
        authTimeElapsed += 1;
        
        // ALWAYS log localStorage checking - this should appear every second
        logDebug(`⏰ Interval check #${authTimeElapsed} - Checking localStorage...`);
        
        try {
          const authDataStr = localStorage.getItem('echoray-auth-data');
          logDebug(`📦 localStorage data at second ${authTimeElapsed}: ${authDataStr ? 'FOUND' : 'NOT FOUND'}`);
          
          if (authDataStr) {
            logDebug(`📦 Raw localStorage data: ${authDataStr}`);
            
            try {
              const authData = JSON.parse(authDataStr);
              logDebug(`📦 Parsed localStorage data: ${JSON.stringify(authData)}`);
              
              if (authData?.source === 'echoray-auth-callback' && 
                  authData?.type === 'SURVEY_AUTH_COMPLETE' && 
                  authData?.userId) {
                
                logDebug(`✅ VALID auth data found! Processing...`);
                localStorage.removeItem('echoray-auth-data');
                
                setAuthCompleted(true);
                authSuccessful = true;
                
                // Store session token if available
                if (authData.sessionToken) {
                  try {
                    sessionStorage.setItem('clerk-session-token', authData.sessionToken);
                    logDebug('✅ Session token stored successfully');
                  } catch (e) {
                    logDebug('❌ Could not store session token in sessionStorage');
                  }
                }
                
                // Try to close the auth window after successful processing
                try {
                  if (authWindowRef.current && !authWindowRef.current.closed) {
                    logDebug('🔚 Closing auth window after localStorage authentication');
                    authWindowRef.current.close();
                  }
                } catch (closeError) {
                  logDebug(`⚠️ Could not close auth window: ${closeError}`);
                }
                
                onComplete(authData.userId);
                clearInterval(checkInterval);
                if (windowCloseTimeoutRef.current) {
                  clearTimeout(windowCloseTimeoutRef.current);
                }
                checkIntervalRef.current = null;
                windowCloseTimeoutRef.current = null;
                return;
              } else {
                logDebug(`❌ Invalid auth data structure: missing required fields`);
              }
            } catch (parseError) {
              logDebug(`❌ Error parsing localStorage data: ${parseError}`);
            }
          }
        } catch (storageError) {
          logDebug(`❌ Error accessing localStorage: ${storageError}`);
        }
        
        // First check if auth is already completed via message event
        if (authCompleted) {
          logDebug('Authentication already completed via message event');
          clearInterval(checkInterval);
          if (windowCloseTimeoutRef.current) {
            clearTimeout(windowCloseTimeoutRef.current);
          }
          checkIntervalRef.current = null;
          windowCloseTimeoutRef.current = null;
          return;
        }
        
        // Rest of the existing logic...
      }, 1000); // Check every second
      
      checkIntervalRef.current = checkInterval;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logDebug(`Error opening auth window: ${errorMessage}`);
      setError(errorMessage);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (windowCloseTimeoutRef.current) {
        clearTimeout(windowCloseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="py-4">
      <div className="flex flex-col items-center text-center gap-6 mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <UserPlus className="h-8 w-8" />
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <Card className="p-6 mb-6 border-2 bg-primary/5">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Why create an account?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Save your project requirements and preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Receive a personalized project proposal</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Track your project's progress in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>Easily communicate with our team</span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => openAuthWindow('sign-up')}
              disabled={isSubmitting || authCompleted}
            >
              Create Account <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center mt-2">
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => openAuthWindow('sign-in')}
              disabled={isSubmitting || authCompleted}
              className="gap-1"
            >
              Already have an account? Sign in <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1" disabled={isSubmitting}>
          <ChevronLeft className="h-4 w-4" /> Back to Survey
        </Button>
      </div>
    </div>
  )
} 