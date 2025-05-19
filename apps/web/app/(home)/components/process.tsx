"use client"

import { useState } from "react"
import { Button } from "@repo/design-system/components/ui/button"
import { Badge } from "@repo/design-system/components/ui/badge"
import { cn } from "@repo/design-system/lib/utils"
import { ClipboardCheck, Search, LineChart, Code, CheckCircle, Rocket, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

export const Process = () => {
  const [activeStep, setActiveStep] = useState(0)

  const steps: { id: number; title: string; description: string; icon: LucideIcon }[] = [
    {
      id: 0,
      title: "Survey",
      description: "Complete our interactive survey to help us understand your needs",
      icon: ClipboardCheck,
    },
    {
      id: 1,
      title: "Analysis",
      description: "We analyze your requirements to determine the optimal approach",
      icon: Search,
    },
    {
      id: 2,
      title: "Planning",
      description: "We create a detailed project plan with timeline and deliverables",
      icon: LineChart,
    },
    {
      id: 3,
      title: "Development",
      description: "Our team builds your solution using modern technologies",
      icon: Code,
    },
    {
      id: 4,
      title: "Review",
      description: "We review the solution with you and make refinements",
      icon: CheckCircle,
    },
    {
      id: 5,
      title: "Launch",
      description: "We deploy your solution and provide ongoing support",
      icon: Rocket,
    },
  ]

  return (
    <section className="w-full py-20 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 mb-16 text-center">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Our Process
          </Badge>
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">How We Work</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Our data-driven approach starts with understanding your needs and ends with a solution that exceeds your
            expectations.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-16 max-w-4xl mx-auto">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          ></div>
          <div className="flex justify-between relative">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className="flex flex-col items-center relative"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                    step.id <= activeStep ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {step.icon && <step.icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "absolute top-12 whitespace-nowrap text-sm font-medium transition-all duration-300",
                    step.id === activeStep ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto text-center mb-12 min-h-[120px] transition-all duration-500">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {(() => {
                const Icon = steps[activeStep].icon;
                return Icon ? <Icon className="h-8 w-8 text-primary" /> : null;
              })()}
            </div>
          </div>
          <h3 className="text-2xl font-medium mb-3">{steps[activeStep].title}</h3>
          <p className="text-muted-foreground">{steps[activeStep].description}</p>

        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (activeStep < steps.length - 1) {
                setActiveStep(activeStep + 1)
              }
            }}
            disabled={activeStep === steps.length - 1}
          >
            Next
          </Button>
        </div>

        <div className="flex justify-center mt-12">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/get-started">
              Start Your Project <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
