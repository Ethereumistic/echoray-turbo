"use client"

import { useState } from "react"
import { Button } from "@repo/design-system/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs"
import { Badge } from "@repo/design-system/components/ui/badge"
import {
  ArrowRight,
  Code,
  BarChart3,
  Video,
  Globe,
  Server,
  Smartphone,
  Database,
  LineChart,
  Bot,
  Cpu,
  Film,
  Presentation,
} from "lucide-react"
import Link from "next/link"

export const Services = () => {
  const [activeTab, setActiveTab] = useState("websites")

  const services = [
    {
      id: "websites",
      title: "Websites & Web Apps",
      description:
        "Fast, responsive, and future-proof digital experiences using cutting-edge open-source technologies.",
      icon: Code,
      color: "text-primary",
      bg: "bg-primary/10",
      subservices: [
        {
          title: "Corporate Websites",
          description: "Professional websites that represent your brand and drive conversions",
          icon: Globe,
        },
        {
          title: "Web Applications",
          description: "Custom web apps that solve specific business problems",
          icon: Server,
        },
        {
          title: "Mobile-First Experiences",
          description: "Responsive designs that work flawlessly across all devices",
          icon: Smartphone,
        },
      ],
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "MongoDB", "Bitcoin", "Nostr"],
    },
    {
      id: "intelligence",
      title: "Business Intelligence & AI",
      description:
        "Transform your data into actionable insights with our custom analytics dashboards and AI-powered tools.",
      icon: BarChart3,
      color: "text-red-500",
      bg: "bg-red-500/10",
      subservices: [
        {
          title: "Data Analytics",
          description: "Comprehensive data analysis and visualization solutions",
          icon: Database,
        },
        {
          title: "Business Dashboards",
          description: "Interactive dashboards that provide real-time insights",
          icon: LineChart,
        },
        {
          title: "AI Integration",
          description: "Custom AI solutions that automate processes and enhance decision-making",
          icon: Bot,
        },
      ],
      technologies: ["Python", "TensorFlow", "PyTorch", "D3.js", "Power BI", "Tableau", "OpenAI API"],
    },
    {
      id: "video",
      title: "Video Production",
      description:
        "Captivate your audience with high-quality video content that tells your story and showcases your products.",
      icon: Video,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      subservices: [
        {
          title: "Product Videos",
          description: "Showcase your products with professional demonstration videos",
          icon: Cpu,
        },
        {
          title: "Corporate Films",
          description: "Tell your company's story through compelling narrative",
          icon: Film,
        },
        {
          title: "Promotional Content",
          description: "Create engaging content for marketing campaigns",
          icon: Presentation,
        },
      ],
      technologies: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Blender", "Final Cut Pro"],
    },
  ]

  return (
    <section className="w-full py-20 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 mb-16 text-center">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Our Expertise
          </Badge>
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Digital Solutions for Every Need</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            We deliver cutting-edge digital services that adapt to the speed of change, built with open-source
            technologies at our core.
          </p>
        </div>

        <Tabs
          defaultValue="websites"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8 ">
            {services.map((service) => (
              <TabsTrigger key={service.id} value={service.id} className=" data-[state=active]:shadow-lg">
                <div className="flex items-center gap-2">
                  <service.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{service.title}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {services.map((service) => (
            <TabsContent key={service.id} value={service.id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-1 overflow-hidden border-0 bg-gradient-to-br bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border-gray-100/20 shadow-xl">
                  <CardHeader>
                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${service.bg} mb-4`}>
                      <service.icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {service.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-secondary/30">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/services/${service.id}`}>
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="col-span-1 lg:col-span-2 border-0 bg-gradient-to-br bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border-gray-100/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">What We Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {service.subservices.map((subservice, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 p-4 rounded-xl bg-card/50 hover:bg-card/80 transition-colors"
                        >
                          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${service.bg}`}>
                            <subservice.icon className={`h-6 w-6 ${service.color}`} />
                          </div>
                          <h4 className="text-lg font-medium">{subservice.title}</h4>
                          <p className="text-sm text-muted-foreground">{subservice.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-center mt-8">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/contact">
              Discuss your project <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
