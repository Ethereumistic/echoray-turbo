"use client"

import { useState } from "react"
import { Button } from '@repo/design-system/components/ui/button';
import { Card } from "@repo/design-system/components/ui/card";
import { env } from '@repo/env';
import { allPosts } from 'content-collections';
import { MoveRight, PhoneCall, Code, BarChart3, Video  } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@repo/design-system/lib/utils"

type ServiceCategory = "websites" | "intelligence" | "video"


export const Hero = () => {
    const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>([])

  const toggleService = (service: ServiceCategory) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const services = [
    {
      id: "websites",
      title: "Websites & Applications",
      description: "Fast, clean, and future-proof digital experiences built with open-source technologies.",
      icon: Code,
    },
    {
      id: "intelligence",
      title: "Business Intelligence & AI",
      description: "Custom analytics dashboards and AI tools that adapt to the speed of change.",
      icon: BarChart3,
    },
    {
      id: "video",
      title: "Video Production",
      description: "Immersive video content that tells your story and engages your audience.",
      icon: Video,
    },
  ]

return (
  // <div className="w-full">
  //   <div className="container mx-auto">
  //     <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
  //       <div>
  //         <Button variant="secondary" size="sm" className="gap-4" asChild>
  //           <Link href={`/blog/${allPosts[0]._meta.path}`}>
  //             Read our latest article <MoveRight className="h-4 w-4" />
  //           </Link>
  //         </Button>
  //       </div>
  //       <div className="flex flex-col gap-4">
  //         <h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
  //           This is the start of something new
  //         </h1>
  //         <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
  //           Managing a small business today is already tough. Avoid further
  //           complications by ditching outdated, tedious trade methods. Our goal
  //           is to streamline SMB trade, making it easier and faster than ever.
  //         </p>
  //       </div>
  //       <div className="flex flex-row gap-3">
  //         <Button size="lg" className="gap-4" variant="outline" asChild>
  //           <Link href="/contact">
  //             Get in touch <PhoneCall className="h-4 w-4" />
  //           </Link>
  //         </Button>
  //         <Button size="lg" className="gap-4" asChild>
  //           <Link href={env.NEXT_PUBLIC_APP_URL}>
  //             Sign up <MoveRight className="h-4 w-4" />
  //           </Link>
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // </div>

      <div className="w-full bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-10 py-16 lg:py-24">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="max-w-3xl font-medium text-4xl tracking-tighter md:text-6xl">
              Digital Solutions for a <span className="text-primary">Borderless</span> Future
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed md:text-xl">
              At Echo Ray, we build cutting-edge digital services that empower creators, businesses, and enterprises in
              a decentralized world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {services.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "relative p-6 cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                  selectedServices.includes(service.id as ServiceCategory)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
                onClick={() => toggleService(service.id as ServiceCategory)}
              >
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium">{service.title}</h3>
                  <p className="text-muted-foreground flex-grow">{service.description}</p>

                  {selectedServices.includes(service.id as ServiceCategory) && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <Button size="lg" className="gap-2 px-8 text-lg h-14" disabled={selectedServices.length === 0} asChild>
              <Link href={selectedServices.length > 0 ? `/get-started?services=${selectedServices.join(",")}` : "#"}>
                Get Started <MoveRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {selectedServices.length === 0
                ? "Select at least one service to continue"
                : `You selected: ${selectedServices.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
