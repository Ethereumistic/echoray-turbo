"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs"
import { Card, CardContent } from "@repo/design-system/components/ui/card"
import {
  DollarSignIcon,
  TrendingUpIcon,
  PieChartIcon,
  TargetIcon,
  CreditCardIcon,
  WalletIcon,
  BarChart3Icon,
} from "lucide-react"

// Import dashboard components
import { OverviewDashboard } from "./components/overview-dashboard"
import { IncomeTracker } from "./components/income-tracker"
import { ExpenseAnalyzer } from "./components/expense-analyzer"
import { BudgetManager } from "./components/budget-manager"
import { FinancialInsights } from "./components/financial-insights"

const dashboardTabs = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3Icon,
    description: "Complete financial snapshot",
  },
  {
    id: "income",
    label: "Income",
    icon: TrendingUpIcon,
    description: "Track income sources",
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: CreditCardIcon,
    description: "Analyze spending patterns",
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: TargetIcon,
    description: "Manage budget goals",
  },
  {
    id: "insights",
    label: "Insights",
    icon: PieChartIcon,
    description: "AI-powered predictions",
  },
]

export default function BudgeteerPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
            <DollarSignIcon className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budgeteer</h1>
            <p className="text-muted-foreground">Personal finance dashboard with AI-powered insights and predictions</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Net Worth</span>
              </div>
              <div className="text-2xl font-bold text-green-600">$24,580</div>
              <div className="text-xs text-muted-foreground">+12.5% this month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Monthly Income</span>
              </div>
              <div className="text-2xl font-bold">$5,200</div>
              <div className="text-xs text-muted-foreground">+3.2% vs last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Monthly Expenses</span>
              </div>
              <div className="text-2xl font-bold">$3,840</div>
              <div className="text-xs text-muted-foreground">-5.1% vs last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TargetIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Savings Rate</span>
              </div>
              <div className="text-2xl font-bold">26.2%</div>
              <div className="text-xs text-muted-foreground">Above target (25%)</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {dashboardTabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <IncomeTracker />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpenseAnalyzer />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <BudgetManager />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <FinancialInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}
