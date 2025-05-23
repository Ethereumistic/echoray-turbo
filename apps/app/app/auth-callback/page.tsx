"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthCallback() {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    // Make the page invisible immediately
    document.body.style.display = 'none';
    document.title = 'Authentication...';
    
    const handleAuth = async () => {
      // Extract query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const callbackType = urlParams.get('callback');
      
      console.log(`🔑 Auth callback triggered, type: ${callbackType || 'none'}`);
      
      // Wait for auth to load
      if (!isLoaded) {
        console.log('⏳ Waiting for auth to load...');
        return;
      }
      
      if (!isSignedIn || !userId) {
        console.log('🚫 User not signed in, redirecting to sign-in');
        window.location.href = '/sign-in';
        return;
      }
      
      try {
        console.log(`🔑 Processing auth for userId: ${userId}`);
        
        // Get session token
        let sessionToken = null;
        try {
          sessionToken = await getToken();
          console.log('🎫 Session token retrieved successfully');
        } catch (tokenError) {
          console.error('❌ Session token error:', tokenError);
        }
        
        // Store auth data in localStorage for cross-domain communication
        const authData = {
          source: 'echoray-auth-callback',
          type: 'AUTH_COMPLETE',
          userId: userId,
          sessionToken: sessionToken,
          timestamp: Date.now()
        };
        
        localStorage.setItem('echoray-auth-data', JSON.stringify(authData));
        console.log('💾 Auth data stored in localStorage');
        
        // Try to send message to parent window (fallback, likely blocked by COOP)
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(authData, "*");
            console.log('✅ Message sent to parent window');
          }
        } catch (postMessageError) {
          console.log('❌ postMessage blocked by COOP policy');
        }
        
        console.log('🔚 Closing auth window...');
        
        // Close the window immediately
        setTimeout(() => {
          window.close();
        }, 100);
        
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        // Still try to close on error
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };
    
    handleAuth();
  }, [isLoaded, isSignedIn, userId, getToken]);

  // Return absolutely nothing to keep page blank
  return null;
} 