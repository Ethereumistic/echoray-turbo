"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@repo/design-system/lib/utils"

// Feature mapping from IDs to labels
const featureLabels: Record<string, string> = {
  "sell-products": "Sell Products/Services",
  "blog": "Blog/News Section",
  "user-accounts": "User Accounts",
  "booking": "Booking/Appointment System",
  "payment": "Payment Processing",
  "contact-forms": "Contact Forms",
  "social-media": "Social Media Integration",
  "live-chat": "Live Chat Support",
  "video-galleries": "Video Galleries",
  "third-party": "Third-Party Integrations"
}

export function PrioritiesQuestion({
  features,
  value,
  onChange,
  onNext,
  onBack
}: {
  features: string[]
  value: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  // Filter out "Other:" features and ensure we have feature IDs
  const availableFeatures = features.filter(f => !f.startsWith("Other:"))
  
  // Initialize state with current priorities or default to first 3 features
  const [priorities, setPriorities] = useState<string[]>(() => {
    if (value && value.length > 0) {
      return value
    }
    
    // Default to first 3 features or fewer if less available
    return availableFeatures.slice(0, Math.min(3, availableFeatures.length))
  })
  
  // Move an item up in the list
  const moveUp = (index: number) => {
    if (index === 0) return
    
    const newPriorities = [...priorities]
    const temp = newPriorities[index]
    newPriorities[index] = newPriorities[index - 1]
    newPriorities[index - 1] = temp
    
    setPriorities(newPriorities)
    onChange(newPriorities)
  }
  
  // Move an item down in the list
  const moveDown = (index: number) => {
    if (index === priorities.length - 1) return
    
    const newPriorities = [...priorities]
    const temp = newPriorities[index]
    newPriorities[index] = newPriorities[index + 1]
    newPriorities[index + 1] = temp
    
    setPriorities(newPriorities)
    onChange(newPriorities)
  }
  
  // Get display name for feature ID
  const getFeatureLabel = (featureId: string) => {
    if (featureId.startsWith("Other:")) {
      return featureId
    }
    return featureLabels[featureId] || featureId
  }
  
  const handleNext = () => {
    onChange(priorities)
    onNext()
  }
  
  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Top Priorities</h3>
      <p className="text-muted-foreground mb-6">
        Rank your top {Math.min(3, availableFeatures.length)} priorities.
      </p>
      
      <div className="mb-6 space-y-2">
        {priorities.map((featureId, index) => (
          <Card
            key={featureId}
            className="p-3 flex items-center border-2 border-border"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {index + 1}
              </div>
              <span>{getFeatureLabel(featureId)}</span>
            </div>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveUp(index)}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveDown(index)}
                disabled={index === priorities.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
} 