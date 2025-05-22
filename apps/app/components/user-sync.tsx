"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { env } from '@repo/env';

/**
 * This component syncs user data from Clerk to the database.
 * It will only sync data when necessary (first sign-up or when user info changes).
 */
export function UserSync() {
  // Add state to ensure component only runs after hydration
  const [isMounted, setIsMounted] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [initialSyncAttempted, setInitialSyncAttempted] = useState(false);
  
  // Only run effects after component is mounted to avoid SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    // Skip if not mounted (to avoid SSR issues), not authenticated, or data not loaded
    if (!isMounted || !isLoaded || !isSignedIn || !userId || !user) {
      return;
    }
    
    // Skip if we've already attempted syncing in this session
    if (initialSyncAttempted) {
      return;
    }
    
    const syncUserToDatabase = async () => {
      try {
        // Get user details from Clerk
        const email = user.primaryEmailAddress?.emailAddress;
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : user.username || "";
        
        // Create a unique identifier for the current user data
        const currentUserData = {
          userId,
          email,
          name: fullName
        };
        
        // Check if we've already synced this user data before
        let prevUserData = null;
        const storageKey = `user_data_${userId}`;
        
        try {
          const prevUserDataString = localStorage.getItem(storageKey);
          prevUserData = prevUserDataString ? JSON.parse(prevUserDataString) : null;
        } catch (e) {
          console.error("Error parsing stored user data:", e);
          // Continue with sync if localStorage fails - safer than skipping
        }
        
        // Mark that we've attempted a sync in this session
        setInitialSyncAttempted(true);
        
        // Only sync if:
        // 1. No previous user data exists in localStorage
        // 2. User data has changed since last sync
        const shouldSync = !prevUserData || 
          prevUserData.email !== email || 
          prevUserData.name !== fullName;
        
        if (!shouldSync) {
          console.log("User data unchanged, skipping sync");
          return;
        }
        
        console.log("Syncing user to database:", userId);
        
        // Prepare the API URL
        const apiUrl = `${env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/users/signup`;
        
        // Call the API to create/update the user
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentUserData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to sync user: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log("User sync result:", data);
        
        // Save the current user data to localStorage to avoid unnecessary syncs
        try {
          localStorage.setItem(storageKey, JSON.stringify(currentUserData));
        } catch (e) {
          console.error("Error saving user data to localStorage:", e);
          // Continue even if localStorage fails
        }
      } catch (error) {
        console.error("Error syncing user to database:", error);
      }
    };
    
    // Sync user data when component mounts or user data changes
    syncUserToDatabase();
  }, [isMounted, isLoaded, isSignedIn, userId, user, initialSyncAttempted]);
  
  // This is a hidden component, it doesn't render anything
  return null;
} 