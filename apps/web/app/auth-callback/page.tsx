"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCheck, CircleCheck } from "lucide-react";

export default function AuthCallback() {
  const [message, setMessage] = useState("Checking authentication status...");
  const [debug, setDebug] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Add a helper function to log debug messages
  const logDebug = (msg: string) => {
    console.log(msg);
    setDebug(prev => [...prev, msg]);
  };
  
  // Function to extract user ID from Clerk's storage
  const extractUserIdFromStorage = () => {
    try {
      // Look for Clerk storage in localStorage
      const clerkStorageKey = Object.keys(localStorage).find(key => 
        key.startsWith('clerk.') && key.endsWith('.userPublicData')
      );
      
      if (clerkStorageKey) {
        const userData = JSON.parse(localStorage.getItem(clerkStorageKey) || '{}');
        if (userData.id) {
          logDebug(`Found userId from localStorage: ${userData.id}`);
          setUserId(userData.id);
          return userData.id;
        }
      }
      
      // Look for other Clerk data that might contain the user ID
      const clerkSessionKey = Object.keys(localStorage).find(key => 
        key.startsWith('clerk.') && key.includes('.session.')
      );
      
      if (clerkSessionKey) {
        const sessionData = JSON.parse(localStorage.getItem(clerkSessionKey) || '{}');
        if (sessionData.userId) {
          logDebug(`Found userId from session data: ${sessionData.userId}`);
          setUserId(sessionData.userId);
          return sessionData.userId;
        }
      }
      
      // Additional attempt: Look for active session key
      const clerkActiveSessionKey = Object.keys(localStorage).find(key => 
        key.startsWith('clerk.') && key.includes('.activeSession')
      );
      
      if (clerkActiveSessionKey) {
        const activeSession = localStorage.getItem(clerkActiveSessionKey) || '';
        if (activeSession && activeSession.startsWith('sess_')) {
          // Try to find a session with this ID
          const matchingSessionKey = Object.keys(localStorage).find(key => 
            key.startsWith('clerk.') && key.includes(activeSession)
          );
          
          if (matchingSessionKey) {
            const sessionData = JSON.parse(localStorage.getItem(matchingSessionKey) || '{}');
            if (sessionData.userId) {
              logDebug(`Found userId from active session: ${sessionData.userId}`);
              setUserId(sessionData.userId);
              return sessionData.userId;
            }
          }
        }
      }
      
      logDebug('No userId found in localStorage');
      return null;
    } catch (e) {
      logDebug('Error extracting user ID from localStorage');
      return null;
    }
  };
  
  // Function to send authentication completion message to parent window
  const sendAuthCompleteMessage = (extractedUserId: string | null) => {
    if (!extractedUserId) {
      logDebug('Warning: No userId to send in auth completion message');
    }
    
    const authData = {
      type: "SURVEY_AUTH_COMPLETE",
      authCompleted: true,
      userId: extractedUserId,
      source: "echoray-auth-callback",
      timestamp: Date.now(),
      isSignUp: isSignUp
    };
    
    // First, always save to localStorage as it's the most reliable
    try {
      localStorage.setItem('echoray-auth-data', JSON.stringify(authData));
      logDebug('Auth data saved to localStorage');
    } catch (storageError) {
      logDebug(`Error saving to localStorage: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
    }
    
    // Then try window.opener if available
    if (window.opener) {
      try {
        logDebug(`Sending postMessage to parent window with userId: ${extractedUserId || 'unknown'}`);
        
        // Try multiple times to ensure delivery
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            try {
              window.opener.postMessage(authData, "*");
              logDebug(`Sent message attempt ${i+1}`);
            } catch (e) {
              logDebug(`Error in message attempt ${i+1}`);
            }
          }, i * 300); // Try at 0ms, 300ms, and 600ms
        }
        
        setIsComplete(true);
        setMessage("Authentication complete! Returning to survey...");
        
        // Close the window after a delay
        setTimeout(() => {
          logDebug('Closing window');
          try {
            window.close();
          } catch (e) {
            logDebug('Could not close window, redirecting instead');
            window.location.href = '/';
          }
        }, 2000);
      } catch (error) {
        logDebug(`Error communicating with parent window: ${error instanceof Error ? error.message : String(error)}`);
        handleNoParentWindow(extractedUserId);
      }
    } else {
      logDebug('No parent window found');
      handleNoParentWindow(extractedUserId);
    }
  };
  
  // Handle case where parent window is not accessible
  const handleNoParentWindow = (extractedUserId: string | null) => {
    setIsComplete(true);
    setMessage("Authentication complete! Redirecting back to application...");
    
    // Redirect back to the app with auth parameters
    setTimeout(() => {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/?auth_completed=true${extractedUserId ? `&userId=${extractedUserId}` : ''}`;
    }, 1500);
  };
  
  useEffect(() => {
    // Get query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const callback = params.get("callback");
    const urlUserId = params.get("userId");
    
    // Detect if this is a sign-up flow
    const currentPath = window.location.pathname;
    const isSignUpFlow = currentPath.includes('sign-up');
    setIsSignUp(isSignUpFlow);
    
    logDebug(`Callback type: ${callback || 'none'}`);
    logDebug(`Has opener: ${window.opener ? 'yes' : 'no'}`);
    logDebug(`Is sign-up flow: ${isSignUpFlow ? 'yes' : 'no'}`);
    
    // Try to get the user ID (from URL or localStorage)
    let extractedUserId = urlUserId;
    if (!extractedUserId) {
      extractedUserId = extractUserIdFromStorage();
    }
    
    if (extractedUserId) {
      logDebug(`Using userId: ${extractedUserId}`);
      setUserId(extractedUserId);
    }
    
    if (callback === "survey") {
      if (isSignUpFlow) {
        setMessage("Account created successfully!");
        
        // For sign-up, we need multiple attempts with increasing delays
        // because the Clerk data might not be in localStorage immediately
        const attemptExtractionAndSend = (attemptNumber: number, maxAttempts: number) => {
          logDebug(`Extraction attempt ${attemptNumber} of ${maxAttempts}`);
          
          const currentUserId = extractedUserId || extractUserIdFromStorage();
          
          if (currentUserId) {
            logDebug(`Found userId on attempt ${attemptNumber}: ${currentUserId}`);
            sendAuthCompleteMessage(currentUserId);
          } else if (attemptNumber < maxAttempts) {
            // Try again with exponential backoff
            const delay = Math.min(500 * Math.pow(1.5, attemptNumber - 1), 3000);
            logDebug(`No userId found, trying again in ${delay}ms`);
            
            setTimeout(() => {
              attemptExtractionAndSend(attemptNumber + 1, maxAttempts);
            }, delay);
          } else {
            // Final attempt failed, send whatever we have
            logDebug('All extraction attempts failed, sending without userId');
            sendAuthCompleteMessage(null);
          }
        };
        
        // Start extraction attempts
        attemptExtractionAndSend(1, 5);
      } else {
        // For sign-in, we can continue automatically right away
        setMessage("Authentication complete! Returning to survey...");
        sendAuthCompleteMessage(extractedUserId);
      }
    } else {
      logDebug('Not a survey callback, redirecting to dashboard');
      setMessage("Authentication complete! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
    
    // Additional safety: If window is still open after 5 seconds, force close/redirect
    setTimeout(() => {
      if (!isComplete) {
        logDebug('Safety timeout reached, forcing completion');
        setIsComplete(true);
        
        if (window.opener) {
          try {
            window.close();
          } catch (e) {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }
      }
    }, 5000);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {isComplete ? (
        <div className="flex flex-col items-center">
          <CircleCheck className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-xl font-medium text-center">{message}</p>
        </div>
      ) : (
        <>
          {isSignUp ? (
            <UserCheck className="h-16 w-16 text-primary mb-4" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          <p className="mt-4 text-xl font-medium text-center">{message}</p>
        </>
      )}
    </div>
  );
} 