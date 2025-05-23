"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AuthCallback() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState('Initializing authentication...');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    // Extract any query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const callbackType = urlParams.get('callback');
    
    if (callbackType !== 'survey') {
      setStatus('Invalid callback type');
      return;
    }
    
    // Only proceed when auth is loaded
    if (!isLoaded) {
      setStatus('Loading authentication status...');
      return;
    }
    
    if (!isSignedIn || !userId) {
      setStatus('You must be signed in to continue. Please sign in or sign up.');
      return;
    }
    
    // Prevent sending multiple messages
    if (messageSent) return;
    
    // Get opener (parent window)
    const opener = window.opener;
    if (!opener) {
      setStatus('Parent window not found. Please try again.');
      return;
    }
    
    try {
      console.log("Sending authentication data to parent window:", { userId });
      
      // Send message to parent window with the user ID
      opener.postMessage(
        {
          type: "SURVEY_AUTH_COMPLETE",
          userId: userId,
          isSignedIn: true
        },
        "*" // This should ideally be the specific origin
      );
      
      setMessageSent(true);
      setStatus('Authentication complete! Returning to survey...');
      
      // Close this window after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      console.error("Error sending message to parent window:", error);
      setStatus('Error completing authentication. Please try again.');
    }
  }, [isLoaded, isSignedIn, userId, messageSent]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Callback</h1>
      <p className="mb-4">{status}</p>
      <p className="text-sm text-muted-foreground">
        This window will close automatically if authentication is successful.
      </p>
    </div>
  );
} 