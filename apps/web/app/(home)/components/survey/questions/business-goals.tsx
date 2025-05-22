"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { Textarea } from "@repo/design-system/components/ui/textarea"
import { useState } from "react"
import { Target } from "lucide-react"

export function BusinessGoalsQuestion({
  value,
  onChange,
  onNext,
  onBack
}: {
  value: string | null
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [goal, setGoal] = useState(value || "")
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value)
  }
  
  const handleNext = () => {
    onChange(goal)
    onNext()
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Business Goals</h3>
      <p className="text-muted-foreground mb-6">
        What's the #1 thing this website must achieve?
      </p>
      
      <Card className="p-6 mb-6 border-2">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-3">Your Primary Goal</h4>
            <Textarea
              placeholder="Example: Get 100+ monthly product sales"
              value={goal}
              onChange={handleChange}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!goal.trim()}>
          Next
        </Button>
      </div>
    </div>
  )
} 