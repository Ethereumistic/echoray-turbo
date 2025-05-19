"use client"

import { useState } from "react"
import { Button } from "@repo/design-system/components/ui/button"
import { Badge } from "@repo/design-system/components/ui/badge"
import { Card, CardContent } from "@repo/design-system/components/ui/card"
import { cn } from "@repo/design-system/lib/utils"
import {
  Zap,
  Lock,
  Code,
  Layers,
  Globe,
  ArrowRight,
  Bitcoin,
  Sparkles,
  Shield,
  Rocket,
  Clock,
  Fingerprint,
  Droplet,
  Link2,

} from "lucide-react"
import Link from "next/link"

export const Benefits = () => {
  const [isHovered, setIsHovered] = useState(false)

  const benefits = [
    {
      title: "Open-Source Foundation",
      description:
        "We build with open-source technologies at our core — smarter, more secure, more transparent, and built to scale beyond closed systems.",
      icon: Code,
    },
    {
      title: "Modular Architecture",
      description:
        "Our modular approach means your solution can adapt and grow with your needs, without being locked into rigid frameworks.",
      icon: Layers,
    },
    {
      title: "Digital Independence",
      description:
        "We don't just build digital tools — we build digital independence, giving you full control over your digital assets.",
      icon: Shield,
    },
    {
      title: "Future-Proof Solutions",
      description:
        "Our solutions are built to last, using cutting-edge technologies that stay ahead of the curve and adapt to change.",
      icon: Rocket,
    },
    {
      title: "Rapid Delivery",
      description:
        "We deliver fast, clean, and efficient solutions that get you to market quickly without sacrificing quality.",
      icon: Clock,
    },
    {
      title: "Borderless Innovation",
      description:
        "We envision a digital future where innovation is borderless, decentralized, and radically empowering.",
      icon: Globe,
    },
  ]

  return (
    <section className="w-full py-20">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Why Choose Us
          </Badge>
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Benefits of Working With Us</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Echo Ray doesn't just deliver digital solutions — we deliver digital independence.
          </p>
        </div>

        {/* Benefits Grid - Made smaller and more compact */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-primary/10 bg-card/50 hover:shadow-sm transition-all duration-300"
            >
              <div className="h-1 w-full bg-primary/20" />
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-medium">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bitcoin Discount Promotion - Made wider on desktop */}
        <div className="w-full mx-auto">
          <Card
            className={cn(
              "overflow-hidden border-0  backdrop-blur-sm transition-all duration-500",
              isHovered ? "shadow-xl shadow-bitcoin/60" : "shadow-lg",
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardContent className="p-6 md:p-8">

              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-center">
                
                <div>
                <div className="flex">
                    <Bitcoin className="w-12 h-12 p-1 text-white bg-bitcoin rounded-full mr-4 mb-6" />

                  <h3 className="text-2xl md:text-3xl font-medium mt-1.5">Pay with <span className="font-bold italic">Bitcoin</span>, Save 10%</h3>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    As a Bitcoin-forward company, we stand on the side of sovereignty, privacy, and the decentralized
                    future of value. When you pay with Bitcoin, you not only save 10% on your project, but you also join
                    us in supporting a more open, transparent financial system.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-bitcoin" />
                      <span className="text-sm">10% off your entire project</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-bitcoin" />
                      <span className="text-sm">Enhanced privacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-bitcoin" />
                      <span className="text-sm">Faster transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-bitcoin" />
                      <span className="text-sm">Support digital sovereignty</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-card p-6 rounded-xl border border-bitcoin/20">
                    <div className="text-center mb-4">
                      <span className="text-5xl font-bold text-bitcoin">10%</span>
                      <span className="text-2xl font-medium ml-4">OFF</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Use Bitcoin for your payment and receive an instant 10% discount on your entire project.
                    </p>
                    <Button className="w-full gap-2 bg-bitcoin hover:bg-bitcoin" size="lg" asChild>
                      <Link href="/get-started">
                        Get Started <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* <div className="flex justify-center items-center gap-6 pt-6">
                    <Badge className="bg-bitcoin text-primary-foreground px-3 py-1"><Link2  className="size-4 mr-1.5"/>On-Chain</Badge>
                    <Badge className="bg-yellow-500 text-primary-foreground px-3 py-1"><Zap className="size-4 mr-1.5"/>Lightning Network</Badge>
                    <Badge className="bg-cyan-500 text-primary-foreground px-3 py-1"><Droplet className="size-4 mr-1.5"/>Liquid</Badge>
                </div> */}

                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-12">
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/about">
              Learn More About Us <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
