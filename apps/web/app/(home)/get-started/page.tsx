"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SurveyDialog } from "../components/survey/survey-dialog"

type ServiceCategory = "websites" | "intelligence" | "video"

// Create a separate component for the content that uses useSearchParams
function GetStartedContent() {
  const searchParams = useSearchParams()
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>([])
  const [surveyOpen, setSurveyOpen] = useState(false)
  
  useEffect(() => {
    // Parse services from URL
    const servicesParam = searchParams.get("services")
    
    if (!servicesParam) {
      // If no services provided, go back to home
      window.location.href = "/";
      return
    }
    
    // Parse and validate services
    const services = servicesParam.split(",") as ServiceCategory[]
    const validServices = services.filter(s => 
      ["websites", "intelligence", "video"].includes(s)
    ) as ServiceCategory[]
    
    if (validServices.length === 0) {
      // If no valid services, go back to home
      window.location.href = "/";
      return
    }
    
    // Set selected services and open survey
    setSelectedServices(validServices)
    setSurveyOpen(true)
  }, [searchParams])
  
  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    setSurveyOpen(open)
    if (!open) {
      // If dialog is closed, go back to home
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SurveyDialog
        isOpen={surveyOpen}
        onOpenChange={handleOpenChange}
        selectedServices={selectedServices}
      />
    </div>
  )
}

// Main page component with Suspense boundary
export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GetStartedContent />
    </Suspense>
  )
} 