"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card"
import { Progress } from "@repo/design-system/components/ui/progress"
import { Badge } from "@repo/design-system/components/ui/badge"
import { TrendingUpIcon, ArrowUpIcon, ArrowDownIcon, CalendarIcon } from "lucide-react"

export function OverviewDashboard() {
  const monthlyData = [
    { month: "Jan", income: 5000, expenses: 3800, savings: 1200 },
    { month: "Feb", income: 5200, expenses: 3900, savings: 1300 },
    { month: "Mar", income: 5100, expenses: 3750, savings: 1350 },
    { month: "Apr", income: 5300, expenses: 3850, savings: 1450 },
    { month: "May", income: 5200, expenses: 3840, savings: 1360 },
  ]

  const budgetCategories = [
    { name: "Housing", budget: 1500, spent: 1450, color: "bg-blue-500" },
    { name: "Food", budget: 600, spent: 580, color: "bg-green-500" },
    { name: "Transportation", budget: 400, spent: 420, color: "bg-yellow-500" },
    { name: "Entertainment", budget: 300, spent: 250, color: "bg-purple-500" },
    { name: "Utilities", budget: 200, spent: 180, color: "bg-red-500" },
    { name: "Other", budget: 340, spent: 360, color: "bg-gray-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Financial Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Financial Trends (Last 5 Months)
          </CardTitle>
          <CardDescription>Track your income, expenses, and savings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{data.month}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Income: ${data.income.toLocaleString()}</span>
                    <span>Expenses: ${data.expenses.toLocaleString()}</span>
                    <span className="text-green-600">Savings: ${data.savings.toLocaleString()}</span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-blue-500 opacity-30" style={{ width: "100%" }} />
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500 opacity-60"
                      style={{ width: `${(data.expenses / data.income) * 100}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-green-500"
                      style={{ width: `${(data.savings / data.income) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Current month budget vs actual spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.budget) * 100
              const isOverBudget = category.spent > category.budget

              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">${category.spent}</span>
                      <span className="text-xs text-muted-foreground">/ ${category.budget}</span>
                      {isOverBudget ? (
                        <Badge variant="destructive" className="text-xs">
                          Over
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(percentage)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "income", description: "Salary Deposit", amount: 5200, date: "2024-01-15", category: "Salary" },
                {
                  type: "expense",
                  description: "Grocery Shopping",
                  amount: -120,
                  date: "2024-01-14",
                  category: "Food",
                },
                {
                  type: "expense",
                  description: "Gas Station",
                  amount: -45,
                  date: "2024-01-13",
                  category: "Transportation",
                },
                {
                  type: "income",
                  description: "Freelance Project",
                  amount: 800,
                  date: "2024-01-12",
                  category: "Side Income",
                },
                {
                  type: "expense",
                  description: "Netflix Subscription",
                  amount: -15,
                  date: "2024-01-11",
                  category: "Entertainment",
                },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
