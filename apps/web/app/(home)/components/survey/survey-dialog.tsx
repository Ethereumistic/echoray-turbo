"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/design-system/components/ui/dialog"
import { Progress } from "@repo/design-system/components/ui/progress"
import { Button } from "@repo/design-system/components/ui/button"
import { ProjectPurposeQuestion } from "./questions/project-purpose"
import { FeaturesQuestion } from "./questions/features"
import { PrioritiesQuestion } from "./questions/priorities"
import { BusinessGoalsQuestion } from "./questions/business-goals"
import { CompetitorsQuestion } from "./questions/competitors"
import { TimelineBudgetQuestion } from "./questions/timeline-budget"
import { FinalTouchQuestion } from "./questions/final-touch"
import { SignupPrompt } from "./signup-prompt"
import { ExitScreen } from "./exit-screen"
import { env } from '@repo/env'

type ServiceCategory = "websites" | "intelligence" | "video"
type SurveyData = {
  projectPurpose: string | null
  features: string[]
  priorities: string[]
  businessGoals: string | null
  competitors: string[]
  timeline: string | null
  budget: string | null
  additionalInfo: string | null
  surveyType: ServiceCategory[]
}

// Default empty survey data
const defaultSurveyData: SurveyData = {
  projectPurpose: null,
  features: [],
  priorities: [],
  businessGoals: null,
  competitors: [],
  timeline: null,
  budget: null,
  additionalInfo: null,
  surveyType: []
}

export function SurveyDialog({ 
  isOpen, 
  onOpenChange, 
  selectedServices 
}: { 
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedServices: ServiceCategory[]
}) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showSignup, setShowSignup] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    ...defaultSurveyData,
    surveyType: selectedServices
  })

  // Reset the survey state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      // Reset state to initial values
      setStep(0)
      setProgress(0)
      setShowSignup(false)
      setShowExit(false)
      setIsSubmitting(false)
      
      // Reset survey data
      const initialData = {
        ...defaultSurveyData,
        surveyType: selectedServices
      }
      
      // Only load from localStorage if there's saved data and we're not showing exit screen
      try {
        const savedData = localStorage.getItem('echoray-survey-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setSurveyData({
            ...initialData,
            ...parsedData,
            surveyType: selectedServices // Always use current selected services
          });
          console.log('Loaded saved survey data from localStorage');
        } else {
          // No saved data, use initial empty state
          setSurveyData(initialData);
        }
      } catch (e) {
        console.error('Error loading survey data from localStorage:', e);
        setSurveyData(initialData);
      }
    }
  }, [isOpen, selectedServices]);

  // Calculate total steps based on selected services
  const totalSteps = selectedServices.includes("websites") ? 7 : 1
  
  useEffect(() => {
    setProgress(Math.round((step / totalSteps) * 100))
  }, [step, totalSteps])
  
  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      // Save survey data to localStorage before showing signup
      try {
        localStorage.setItem('echoray-survey-data', JSON.stringify(surveyData));
        console.log('Saved survey data to localStorage before signup');
      } catch (e) {
        console.error('Error saving survey data to localStorage:', e);
      }
      setShowSignup(true)
    }
  }
  
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }
  
  // Function to get session token for API requests
  const getSessionToken = (): string | null => {
    try {
      return sessionStorage.getItem('clerk-session-token');
    } catch (e) {
      console.warn('Could not access session token from storage');
      return null;
    }
  };

  const handleSignupComplete = async (userId: string) => {
    try {
      setIsSubmitting(true)
      console.log('Received userId from authentication:', userId);
      
      // Get survey data from localStorage directly for submission
      let submissionData = { ...surveyData };
      
      try {
        const savedData = localStorage.getItem('echoray-survey-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('Found saved survey data:', parsedData);
          
          // Use the localStorage data directly for submission
          submissionData = {
            ...parsedData,
            surveyType: selectedServices // Always use current selected services
          };
          
          // Also update the state for UI consistency
          setSurveyData(submissionData);
          console.log('Using localStorage data for submission');
        } else {
          console.warn('No saved survey data found in localStorage!');
        }
      } catch (e) {
        console.error('Error accessing localStorage survey data:', e);
      }
      
      if (!userId || !userId.startsWith('user_')) {
        throw new Error('Invalid user ID. Please try again with a valid account.');
      }
      
      // First, ensure the user exists in our database
      const baseUrl = env.NEXT_PUBLIC_API_URL || 'https://api.echoray.io';
      
      await ensureUserExists(userId, baseUrl);
      
      // Now, submit the survey data
      const surveyApiUrl = baseUrl.endsWith('/') ? `${baseUrl}survey` : `${baseUrl}/survey`;
      
      console.log('Submitting survey data to:', surveyApiUrl);
      console.log('Survey data:', submissionData);
      console.log('Using userId:', userId);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add session token if available
      const sessionToken = getSessionToken();
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        console.log('Using session token for survey submission');
      }
      
        const response = await fetch(surveyApiUrl, {
          method: 'POST',
        headers,
          body: JSON.stringify({
            ...submissionData,
            // Pass the userId from auth
            userId: userId
          }),
          credentials: 'include', // Include credentials for authentication
        });
        
        // First check if the response is valid JSON
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('Invalid JSON response from survey API:', await response.text());
          throw new Error('Invalid response from server. Please try again.');
        }
        
        if (!response.ok) {
          console.error('Failed to submit survey:', responseData);
          throw new Error(responseData.error || 'Failed to submit survey');
        }
        
        console.log('Survey submitted successfully:', responseData);
        
        // Clear localStorage after successful submission
        try {
          localStorage.removeItem('echoray-survey-data');
          console.log('Cleared survey data from localStorage after successful submission');
        } catch (e) {
          console.error('Error clearing localStorage:', e);
        }
        
        // Show the exit screen
        setShowSignup(false)
        setShowExit(true)
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('There was an error submitting your survey. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  };

  // Function to create/verify user in database
  const ensureUserExists = async (userId: string, baseUrl: string) => {
    console.log('Ensuring user exists in database:', userId);
    
    try {
      const userApiUrl = baseUrl.endsWith('/') ? `${baseUrl}users/signup` : `${baseUrl}/users/signup`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add session token if available
      const sessionToken = getSessionToken();
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        console.log('Using session token for user creation/verification');
      }
      
      const userResponse = await fetch(userApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: userId,
          // Additional user data could go here
        }),
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Failed to create/verify user');
      }
      
      const userData = await userResponse.json();
      console.log('User created/verified successfully:', userData);
      return userData;
    } catch (userError) {
      console.error('Error creating/verifying user:', userError);
      // Instead of continuing despite the error, we'll check authentication and retry
      console.log('Checking authentication status before continuing...');
      
      try {
        // Check if the user is authenticated
        const authCheckUrl = baseUrl.endsWith('/') ? `${baseUrl}auth/check` : `${baseUrl}/auth/check`;
        
        const authHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        // Add session token if available
        const sessionToken = getSessionToken();
        if (sessionToken) {
          authHeaders['Authorization'] = `Bearer ${sessionToken}`;
        }
        
        const authResponse = await fetch(authCheckUrl, {
          method: 'GET',
          headers: authHeaders,
          credentials: 'include',
        });
        
        const authData = await authResponse.json();
        console.log('Auth check response:', authData);
        
        if (authData.isAuthenticated && authData.userId) {
          console.log('User is authenticated, proceeding with survey submission');
          return { success: true, userId: authData.userId };
        } else {
          throw new Error('User authentication failed. Please try again.');
        }
      } catch (authError) {
        console.error('Authentication check failed:', authError);
        throw new Error('Failed to verify authentication. Please try again.');
      }
    }
  };
  
  const handleClose = () => {
    if (showExit) {
      window.location.href = "/dashboard";
    }
    onOpenChange(false)
  }
  
  const updateSurveyData = (key: keyof SurveyData, value: any) => {
    setSurveyData(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Save to localStorage whenever survey data is updated
    try {
      const updatedData = {
        ...surveyData,
        [key]: value
      };
      localStorage.setItem('echoray-survey-data', JSON.stringify(updatedData));
    } catch (e) {
      // Silently fail, we don't want to interrupt the user experience
    }
  }
  
  // Always update the survey type when selectedServices changes
  useEffect(() => {
    updateSurveyData('surveyType', selectedServices)
  }, [selectedServices])
  
  // Render questions based on selected services and current step
  const renderQuestion = () => {
    // If only intelligence or video is selected
    if (!selectedServices.includes("websites") && 
        (selectedServices.includes("intelligence") || selectedServices.includes("video"))) {
      return (
        <div className="py-8">
          <h3 className="text-xl font-medium mb-4">
            {selectedServices.includes("intelligence") ? "Intelligence Survey" : "Video Survey"}
          </h3>
          <p className="text-muted-foreground mb-6">
            This is a dummy question for the {selectedServices.join(" & ")} survey.
          </p>
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={handleNext}>
              Complete Survey
            </Button>
          </div>
        </div>
      )
    }
    
    // For websites (with or without other services)
    switch (step) {
      case 0:
        return <ProjectPurposeQuestion 
                 value={surveyData.projectPurpose} 
                 onChange={(value) => updateSurveyData("projectPurpose", value)}
                 onNext={handleNext} 
               />
      case 1:
        return <FeaturesQuestion 
                 value={surveyData.features}
                 onChange={(value) => updateSurveyData("features", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      case 2:
        return <PrioritiesQuestion 
                 features={surveyData.features}
                 value={surveyData.priorities}
                 onChange={(value: string[]) => updateSurveyData("priorities", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      case 3:
        return <BusinessGoalsQuestion 
                 value={surveyData.businessGoals}
                 onChange={(value) => updateSurveyData("businessGoals", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      case 4:
        return <CompetitorsQuestion 
                 value={surveyData.competitors}
                 onChange={(value: string[]) => updateSurveyData("competitors", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      case 5:
        return <TimelineBudgetQuestion 
                 timeline={surveyData.timeline}
                 budget={surveyData.budget}
                 onTimelineChange={(value: string) => updateSurveyData("timeline", value)}
                 onBudgetChange={(value: string) => updateSurveyData("budget", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      case 6:
        return <FinalTouchQuestion 
                 value={surveyData.additionalInfo}
                 onChange={(value) => updateSurveyData("additionalInfo", value)}
                 onNext={handleNext}
                 onBack={handleBack}
               />
      default:
        return null
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {!showSignup && !showExit && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedServices.length > 0 
                  ? `Your ${selectedServices.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")} Survey`
                  : "Project Survey"}
              </DialogTitle>
              <DialogDescription>
                Help us understand your project better to provide the best solution.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2">
              <Progress value={progress} className="h-2 mb-6" />
              {renderQuestion()}
            </div>
          </>
        )}
        
        {showSignup && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Account Required</DialogTitle>
              <DialogDescription>
                Create an account or sign in to save your survey and get your personalized proposal.
              </DialogDescription>
            </DialogHeader>
            <SignupPrompt 
              onComplete={handleSignupComplete}
              onBack={() => setShowSignup(false)}
              isSubmitting={isSubmitting}
            />
          </>
        )}
        
        {showExit && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Thank You!</DialogTitle>
              <DialogDescription>
                Your responses have been saved. Our team is already working on your project.
              </DialogDescription>
            </DialogHeader>
            <ExitScreen onClose={handleClose} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 