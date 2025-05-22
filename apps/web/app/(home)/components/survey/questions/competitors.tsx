"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { Input } from "@repo/design-system/components/ui/input"
import { useState } from "react"
import { Globe } from "lucide-react"

export function CompetitorsQuestion({
  value,
  onChange,
  onNext,
  onBack
}: {
  value: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const [competitors, setCompetitors] = useState<string[]>(() => {
    if (value && value.length > 0) {
      // Ensure we have 3 slots (filling empty ones with "")
      return [...value, "", "", ""].slice(0, 3)
    }
    return ["", "", ""] // 3 empty inputs by default
  })
  
  const handleChange = (index: number, value: string) => {
    const newCompetitors = [...competitors]
    newCompetitors[index] = value
    setCompetitors(newCompetitors)
  }
  
  const handleNext = () => {
    // Filter out empty strings
    const filteredCompetitors = competitors.filter(c => c.trim() !== "")
    onChange(filteredCompetitors)
    onNext()
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Competitor Inspiration</h3>
      <p className="text-muted-foreground mb-6">
        Share 1-3 websites you like the look/feel of. This helps us understand your style preferences.
      </p>
      
      <Card className="p-6 mb-6 border-2">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-4">
            <h4 className="font-medium">Websites You Like</h4>
            
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  {index + 1}
                </div>
                <Input
                  placeholder="https://example.com"
                  value={competitor}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
            
            <p className="text-sm text-muted-foreground italic">
              You don't need to fill all fields if you have fewer examples.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={competitors.every(c => c.trim() === "")}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 