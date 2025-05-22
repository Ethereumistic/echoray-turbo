"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { CheckCircle2, LayoutTemplate, Palette, MessageSquare } from "lucide-react"

export function ExitScreen({
  onClose
}: {
  onClose: () => void
}) {
  return (
    <div className="py-8">
      <div className="flex flex-col items-center text-center gap-6 mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-center gap-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <h3 className="font-medium">Build Your Prototype</h3>
          <p className="text-sm text-muted-foreground">
            We'll create a working prototype based on your requirements.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center gap-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <Palette className="h-6 w-6" />
          </div>
          <h3 className="font-medium">Share Design Concepts</h3>
          <p className="text-sm text-muted-foreground">
            You'll receive 3 unique design concepts to choose from.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center gap-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-medium">Jargon-Free Communication</h3>
          <p className="text-sm text-muted-foreground">
            We'll keep all explanations clear and straightforward.
          </p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={onClose} size="lg">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
} 