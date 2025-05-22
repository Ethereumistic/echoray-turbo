"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { Input } from "@repo/design-system/components/ui/input"
import { useState } from "react"
import { ShoppingCart, BriefcaseBusiness, Users, MailPlus, Shapes, PencilRuler } from "lucide-react"
import { cn } from "@repo/design-system/lib/utils"

type ProjectType = 
  | "Online Store"
  | "Portfolio/Brochure"
  | "Membership Site"
  | "Lead Generator"
  | "Interactive Tool"
  | "Other"

interface ProjectTypeOption {
  value: ProjectType
  label: string
  icon: React.ElementType
  description: string
}

const projectTypes: ProjectTypeOption[] = [
  {
    value: "Online Store",
    label: "Online Store",
    icon: ShoppingCart,
    description: "Sell products or services online"
  },
  {
    value: "Portfolio/Brochure",
    label: "Portfolio/Brochure",
    icon: BriefcaseBusiness,
    description: "Showcase your work and services"
  },
  {
    value: "Membership Site",
    label: "Membership Site",
    icon: Users,
    description: "Exclusive content for members"
  },
  {
    value: "Lead Generator",
    label: "Lead Generator",
    icon: MailPlus,
    description: "Capture emails and contacts"
  },
  {
    value: "Interactive Tool",
    label: "Interactive Tool",
    icon: Shapes,
    description: "Calculators, quizzes, and more"
  },
  {
    value: "Other",
    label: "Other",
    icon: PencilRuler,
    description: "Something else entirely"
  }
]

export function ProjectPurposeQuestion({
  value,
  onChange,
  onNext
}: {
  value: string | null
  onChange: (value: string) => void
  onNext: () => void
}) {
  const [otherValue, setOtherValue] = useState("")
  const [selected, setSelected] = useState<ProjectType | null>(value as ProjectType | null)
  
  const handleSelect = (type: ProjectType) => {
    setSelected(type)
    if (type !== "Other") {
      onChange(type)
    }
  }
  
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherValue(e.target.value)
    onChange(`Other: ${e.target.value}`)
  }
  
  const handleNext = () => {
    if (selected === "Other" && otherValue) {
      onChange(`Other: ${otherValue}`)
    }
    onNext()
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">What best describes your project?</h3>
      <p className="text-muted-foreground mb-6">Select the option that most closely matches your project goal.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {projectTypes.map((type) => (
          <Card 
            key={type.value}
            className={cn(
              "relative p-4 cursor-pointer border-2 transition-all hover:shadow-md",
              selected === type.value 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/20"
            )}
            onClick={() => handleSelect(type.value)}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <type.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">{type.label}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              
              {selected === type.value && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {selected === "Other" && (
        <div className="mb-6">
          <Input 
            placeholder="Please describe your project" 
            value={otherValue}
            onChange={handleOtherChange}
            className="w-full"
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!selected || (selected === "Other" && !otherValue)}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 