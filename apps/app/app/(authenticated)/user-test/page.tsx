"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { useState, useEffect } from "react";
import { env } from '@repo/env';

export default function UserTestPage() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted flag to ensure we only access localStorage on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Check if this user has been synced before
  useEffect(() => {
    if (!isMounted || !userId) return;
    
    try {
      const storedData = localStorage.getItem(`user_data_${userId}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          const syncDate = new Date().toLocaleString();
          setLastSynced(`Last synced: ${syncDate}\nEmail: ${parsedData.email}\nName: ${parsedData.name}`);
        } catch (e) {
          setLastSynced("Found sync data but couldn't parse it");
        }
      } else {
        setLastSynced("No previous sync data found");
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      setLastSynced("Error accessing browser storage");
    }
  }, [isMounted, userId]);
  
  const handleClearSyncHistory = () => {
    if (!userId) return;
    
    try {
      localStorage.removeItem(`user_data_${userId}`);
      setLastSynced("Sync history cleared");
      setSyncStatus("Sync history cleared. Next sign-in will trigger a fresh sync.");
    } catch (e) {
      console.error("Error clearing localStorage:", e);
      setSyncStatus("Error: Failed to clear sync history");
    }
  };
  
  const handleManualSync = async () => {
    if (!userId || !isSignedIn) {
      setSyncStatus("Error: You must be signed in");
      return;
    }
    
    setIsLoading(true);
    setSyncStatus("Syncing user data...");
    
    try {
      // Get user details from Clerk
      const email = user?.primaryEmailAddress?.emailAddress;
      const firstName = user?.firstName || "";
      const lastName = user?.lastName || "";
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : user?.username || "";
      
      // Prepare the API URL
      const apiUrl = `${env.NEXT_PUBLIC_API_URL || 'https://api.echoray.io'}/users/signup`;
      
      const userData = {
        userId,
        email,
        name: fullName
      };
      
      // Call the API to create/update the user
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to sync user: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Manual user sync response:", data);
      setSyncStatus(`Success: ${data.message}`);
      
      // Update localStorage with the new sync data
      try {
        localStorage.setItem(`user_data_${userId}`, JSON.stringify(userData));
        const syncDate = new Date().toLocaleString();
        setLastSynced(`Last synced: ${syncDate}\nEmail: ${email}\nName: ${fullName}`);
      } catch (e) {
        console.error("Error updating localStorage:", e);
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      setSyncStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isLoaded) {
    return <div className="p-8">Loading authentication status...</div>;
  }
  
  if (!isSignedIn) {
    return <div className="p-8">You must be signed in to use this page.</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">User Test Page</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your current Clerk user details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong className="font-medium">User ID:</strong> {userId}
            </div>
            <div>
              <strong className="font-medium">Email:</strong> {user?.primaryEmailAddress?.emailAddress || 'Not set'}
            </div>
            <div>
              <strong className="font-medium">Name:</strong> {user?.firstName} {user?.lastName}
            </div>
            <div>
              <strong className="font-medium">Username:</strong> {user?.username || 'Not set'}
            </div>
            
            {isMounted && lastSynced && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <strong className="font-medium">Sync Status:</strong>
                <pre className="text-xs mt-1 whitespace-pre-wrap">{lastSynced}</pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button 
            onClick={handleManualSync} 
            disabled={isLoading}
          >
            {isLoading ? 'Syncing...' : 'Manually Sync User to Database'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleClearSyncHistory}
            disabled={isLoading || !lastSynced || lastSynced === "No previous sync data found"}
          >
            Clear Sync History
          </Button>
          
          {syncStatus && (
            <div className={`w-full mt-2 text-sm ${syncStatus.startsWith('Error') ? 'text-destructive' : syncStatus.startsWith('Success') ? 'text-success' : 'text-foreground'}`}>
              {syncStatus}
            </div>
          )}
        </CardFooter>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>This page tests the user creation functionality in the database.</p>
        <p>The UserSync component automatically creates your user record in the database the first time you sign up, or when your profile info changes.</p>
        <p>You can manually trigger a sync using the button above, or clear your sync history to force a fresh sync on next login.</p>
      </div>
    </div>
  );
} 