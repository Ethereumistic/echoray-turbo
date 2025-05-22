"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@repo/design-system/components/ui/radio-group"
import { Label } from "@repo/design-system/components/ui/label"
import { useState } from "react"
import { Clock, DollarSign } from "lucide-react"
import { cn } from "@repo/design-system/lib/utils"

type Timeline = "ASAP" | "1-3 Months" | "Flexible Timeline"
type Budget = "< $5k" | "$5k-$15k" | "$15k-$30k" | "Custom/Enterprise"

export function TimelineBudgetQuestion({
  timeline,
  budget,
  onTimelineChange,
  onBudgetChange,
  onNext,
  onBack
}: {
  timeline: string | null
  budget: string | null
  onTimelineChange: (value: string) => void
  onBudgetChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(
    timeline as Timeline || null
  )
  
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(
    budget as Budget || null
  )
  
  const handleTimelineChange = (value: Timeline) => {
    setSelectedTimeline(value)
    onTimelineChange(value)
  }
  
  const handleBudgetChange = (value: Budget) => {
    setSelectedBudget(value)
    onBudgetChange(value)
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Timeline & Budget</h3>
      <p className="text-muted-foreground mb-6">
        Help us understand your timeframe and budget constraints.
      </p>
      
      <div className="space-y-8 mb-6">
        {/* Timeline Section */}
        <Card className="p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-4">How soon do you want this live?</h4>
              
              <RadioGroup 
                value={selectedTimeline || undefined} 
                onValueChange={(value) => handleTimelineChange(value as Timeline)}
                className="grid grid-cols-1 md:grid-cols-3 gap-2"
              >
                {[
                  { value: "ASAP", label: "ASAP (Priority Launch)" },
                  { value: "1-3 Months", label: "1-3 Months" },
                  { value: "Flexible Timeline", label: "Flexible Timeline" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`timeline-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`timeline-${option.value}`}
                      className={cn(
                        "flex flex-1 cursor-pointer rounded-md border-2 border-muted p-3 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      )}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Card>
        
        {/* Budget Section */}
        <Card className="p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-4">Budget Range:</h4>
              
              <RadioGroup 
                value={selectedBudget || undefined} 
                onValueChange={(value) => handleBudgetChange(value as Budget)}
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {[
                  { value: "< $5k", label: "< $5k" },
                  { value: "$5k-$15k", label: "$5k-$15k" },
                  { value: "$15k-$30k", label: "$15k-$30k" },
                  { value: "Custom/Enterprise", label: "Custom/Enterprise" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`budget-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`budget-${option.value}`}
                      className={cn(
                        "flex flex-1 cursor-pointer rounded-md border-2 border-muted p-3 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      )}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedTimeline || !selectedBudget}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 