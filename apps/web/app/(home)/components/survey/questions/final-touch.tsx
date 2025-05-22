"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { Textarea } from "@repo/design-system/components/ui/textarea"
import { useState } from "react"
import { MessageSquare } from "lucide-react"

export function FinalTouchQuestion({
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
  const [additionalInfo, setAdditionalInfo] = useState(value || "")
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInfo(e.target.value)
  }
  
  const handleNext = () => {
    onChange(additionalInfo)
    onNext()
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Final Touch</h3>
      <p className="text-muted-foreground mb-6">
        Anything else we should know about your project?
      </p>
      
      <Card className="p-6 mb-6 border-2">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-3">Additional Information</h4>
            <Textarea
              placeholder="Share any other requirements, questions, or details that would help us understand your project better."
              value={additionalInfo}
              onChange={handleChange}
              className="min-h-[150px]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              This field is optional.
            </p>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Complete Survey
        </Button>
      </div>
    </div>
  )
} 