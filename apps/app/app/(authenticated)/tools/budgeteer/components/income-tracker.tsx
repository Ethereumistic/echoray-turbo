"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card"
import { Button } from "@repo/design-system/components/ui/button"
import { Input } from "@repo/design-system/components/ui/input"
import { Label } from "@repo/design-system/components/ui/label"
import { Badge } from "@repo/design-system/components/ui/badge"
import { Progress } from "@repo/design-system/components/ui/progress"
import { PlusIcon, TrendingUpIcon, DollarSignIcon, CalendarIcon, BriefcaseIcon, PiggyBankIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select"

export function IncomeTracker() {
  const [showAddForm, setShowAddForm] = useState(false)

  const incomeStreams = [
    {
      id: 1,
      source: "Primary Job",
      type: "Salary",
      amount: 5200,
      frequency: "Monthly",
      icon: BriefcaseIcon,
      color: "bg-blue-500",
      growth: "+3.2%",
    },
    {
      id: 2,
      source: "Freelance Work",
      type: "Contract",
      amount: 800,
      frequency: "Variable",
      icon: DollarSignIcon,
      color: "bg-green-500",
      growth: "+15.8%",
    },
    {
      id: 3,
      source: "Investment Returns",
      type: "Passive",
      amount: 320,
      frequency: "Monthly",
      icon: TrendingUpIcon,
      color: "bg-purple-500",
      growth: "+8.4%",
    },
    {
      id: 4,
      source: "Side Business",
      type: "Business",
      amount: 450,
      frequency: "Monthly",
      icon: PiggyBankIcon,
      color: "bg-orange-500",
      growth: "+22.1%",
    },
  ]

  const totalMonthlyIncome = incomeStreams.reduce((sum, stream) => sum + stream.amount, 0)
  const yearlyProjection = totalMonthlyIncome * 12

  return (
    <div className="space-y-6">
      {/* Income Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Monthly Total</span>
            </div>
            <div className="text-2xl font-bold">${totalMonthlyIncome.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">+8.7% vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Yearly Projection</span>
            </div>
            <div className="text-2xl font-bold">${yearlyProjection.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Based on current trends</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Income Streams</span>
            </div>
            <div className="text-2xl font-bold">{incomeStreams.length}</div>
            <div className="text-xs text-muted-foreground">Active sources</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Manage your income streams</CardDescription>
              </div>
              <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeStreams.map((stream) => {
              const IconComponent = stream.icon
              const percentage = (stream.amount / totalMonthlyIncome) * 100

              return (
                <div key={stream.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stream.color}/10`}>
                        <IconComponent
                          className={`h-4 w-4 text-white`}
                          style={{ color: stream.color.replace("bg-", "").replace("-500", "") }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{stream.source}</div>
                        <div className="text-sm text-muted-foreground">{stream.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${stream.amount.toLocaleString()}</div>
                      <Badge variant="secondary" className="text-xs">
                        {stream.frequency}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{percentage.toFixed(1)}% of total income</span>
                      <span className="text-green-600">{stream.growth}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Add Income Form / Income Goals */}
        <Card>
          <CardHeader>
            <CardTitle>{showAddForm ? "Add New Income Source" : "Income Goals"}</CardTitle>
            <CardDescription>
              {showAddForm ? "Track a new source of income" : "Set and track your income targets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAddForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Income Source</Label>
                  <Input id="source" placeholder="e.g., Part-time job" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select income type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="passive">Passive</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monthly Amount</Label>
                  <Input id="amount" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Add Income Source</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Monthly Goal</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">$7,000</div>
                  <div className="text-sm text-green-600">Target: December 2024</div>
                  <Progress value={74} className="mt-2 h-2" />
                  <div className="text-xs text-green-600 mt-1">74% achieved</div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Yearly Goal</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">$84,000</div>
                  <div className="text-sm text-blue-600">Target: End of 2024</div>
                  <Progress value={68} className="mt-2 h-2" />
                  <div className="text-xs text-blue-600 mt-1">68% achieved</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
