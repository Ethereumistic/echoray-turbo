"use client"

import { Button } from "@repo/design-system/components/ui/button"
import { Card } from "@repo/design-system/components/ui/card"
import { Input } from "@repo/design-system/components/ui/input"
import { useState } from "react"
import { 
  ShoppingBag, 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  Mail, 
  Share2, 
  MessageCircle,
  Video,
  Link2,
  PencilRuler
} from "lucide-react"
import { cn } from "@repo/design-system/lib/utils"

interface FeatureOption {
  id: string
  label: string
  icon: React.ElementType
}

const featureOptions: FeatureOption[] = [
  {
    id: "sell-products",
    label: "Sell Products/Services",
    icon: ShoppingBag
  },
  {
    id: "blog",
    label: "Blog/News Section",
    icon: FileText
  },
  {
    id: "user-accounts",
    label: "User Accounts",
    icon: Users
  },
  {
    id: "booking",
    label: "Booking/Appointment System",
    icon: Calendar
  },
  {
    id: "payment",
    label: "Payment Processing",
    icon: CreditCard
  },
  {
    id: "contact-forms",
    label: "Contact Forms",
    icon: Mail
  },
  {
    id: "social-media",
    label: "Social Media Integration",
    icon: Share2
  },
  {
    id: "live-chat",
    label: "Live Chat Support",
    icon: MessageCircle
  },
  {
    id: "video-galleries",
    label: "Video Galleries",
    icon: Video
  },
  {
    id: "third-party",
    label: "Third-Party Integrations",
    icon: Link2
  }
]

export function FeaturesQuestion({
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
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(value || [])
  const [otherFeature, setOtherFeature] = useState("")
  const [showOther, setShowOther] = useState(value?.some(item => item.startsWith("Other:")) || false)
  
  const toggleFeature = (featureId: string) => {
    if (featureId === "other") {
      setShowOther(!showOther)
      return
    }
    
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId)
      } else {
        return [...prev, featureId]
      }
    })
  }
  
  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherFeature(e.target.value)
  }
  
  const handleNext = () => {
    let features = [...selectedFeatures]
    
    // Add other feature if present
    if (showOther && otherFeature) {
      features = features.filter(f => !f.startsWith("Other:"))
      features.push(`Other: ${otherFeature}`)
    }
    
    onChange(features)
    onNext()
  }

  return (
    <div className="py-4">
      <h3 className="text-xl font-medium mb-2">Must-Have Features</h3>
      <p className="text-muted-foreground mb-6">Select all the features you need for your project.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {featureOptions.map((feature) => (
          <Card 
            key={feature.id}
            className={cn(
              "relative p-4 cursor-pointer border-2 transition-all hover:shadow-md h-28",
              selectedFeatures.includes(feature.id) 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/20"
            )}
            onClick={() => toggleFeature(feature.id)}
          >
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.label}</h4>
              </div>
              
              {selectedFeatures.includes(feature.id) && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
          </Card>
        ))}
        
        <Card 
          className={cn(
            "relative p-4 cursor-pointer border-2 transition-all hover:shadow-md h-28",
            showOther 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/20"
          )}
          onClick={() => toggleFeature("other")}
        >
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <PencilRuler className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Other</h4>
            </div>
            
            {showOther && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
            )}
          </div>
        </Card>
      </div>
      
      {showOther && (
        <div className="mb-6">
          <Input 
            placeholder="Describe other feature" 
            value={otherFeature}
            onChange={handleOtherChange}
            className="w-full"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={(selectedFeatures.length === 0) || (showOther && !otherFeature)}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 