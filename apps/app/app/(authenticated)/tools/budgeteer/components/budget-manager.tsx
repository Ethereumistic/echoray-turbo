"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card"
import { Badge } from "@repo/design-system/components/ui/badge"
import { Progress } from "@repo/design-system/components/ui/progress"
import { Button } from "@repo/design-system/components/ui/button"
import {
  CreditCardIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  ShoppingCartIcon,
  CarIcon,
  HomeIcon,
  UtensilsIcon,
  GamepadIcon,
  MoreHorizontalIcon,
} from "lucide-react"

export function BudgetManager() {
  const expenseCategories = [
    {
      name: "Housing",
      amount: 1450,
      budget: 1500,
      icon: HomeIcon,
      color: "bg-blue-500",
      transactions: 3,
      trend: -2.1,
    },
    {
      name: "Food & Dining",
      amount: 580,
      budget: 600,
      icon: UtensilsIcon,
      color: "bg-green-500",
      transactions: 12,
      trend: +5.3,
    },
    {
      name: "Transportation",
      amount: 420,
      budget: 400,
      icon: CarIcon,
      color: "bg-yellow-500",
      transactions: 8,
      trend: +8.7,
    },
    {
      name: "Shopping",
      amount: 320,
      budget: 350,
      icon: ShoppingCartIcon,
      color: "bg-purple-500",
      transactions: 15,
      trend: -12.4,
    },
    {
      name: "Entertainment",
      amount: 250,
      budget: 300,
      icon: GamepadIcon,
      color: "bg-pink-500",
      transactions: 6,
      trend: -8.2,
    },
    {
      name: "Other",
      amount: 360,
      budget: 340,
      icon: MoreHorizontalIcon,
      color: "bg-gray-500",
      transactions: 9,
      trend: +15.6,
    },
  ]

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const totalBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const overBudgetCategories = expenseCategories.filter((cat) => cat.amount > cat.budget)

  const recentExpenses = [
    {
      description: "Whole Foods Market",
      amount: 87.32,
      category: "Food & Dining",
      date: "2024-01-15",
      merchant: "Grocery",
    },
    { description: "Shell Gas Station", amount: 45.2, category: "Transportation", date: "2024-01-14", merchant: "Gas" },
    {
      description: "Netflix Subscription",
      amount: 15.99,
      category: "Entertainment",
      date: "2024-01-13",
      merchant: "Streaming",
    },
    { description: "Amazon Purchase", amount: 124.5, category: "Shopping", date: "2024-01-12", merchant: "Online" },
    { description: "Electric Bill", amount: 89.45, category: "Housing", date: "2024-01-11", merchant: "Utilities" },
  ]

  return (
    <div className="space-y-6">
      {/* Expense Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Total Expenses</span>
            </div>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDownIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">vs Budget</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${(totalBudget - totalExpenses).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Under budget</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Over Budget</span>
            </div>
            <div className="text-2xl font-bold">{overBudgetCategories.length}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Daily</span>
            </div>
            <div className="text-2xl font-bold">${Math.round(totalExpenses / 30)}</div>
            <div className="text-xs text-muted-foreground">Spending rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Spending breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category) => {
              const IconComponent = category.icon
              const percentage = (category.amount / category.budget) * 100
              const isOverBudget = category.amount > category.budget

              return (
                <div key={category.name} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}/10`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.transactions} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${category.amount.toLocaleString()}</div>
                      <div className={`text-xs ${category.trend > 0 ? "text-red-500" : "text-green-500"}`}>
                        {category.trend > 0 ? "+" : ""}
                        {category.trend}%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${category.amount} / ${category.budget}
                      </span>
                      {isOverBudget ? (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(percentage)}%
                        </Badge>
                      )}
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest spending activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <CreditCardIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.merchant} • {expense.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">-${expense.amount.toFixed(2)}</div>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Spending Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
          <CardDescription>AI-powered analysis of your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDownIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Spending Trend</span>
              </div>
              <p className="text-sm text-blue-700">
                Your spending decreased by 5.1% compared to last month. Great job on controlling expenses!
              </p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Watch Out</span>
              </div>
              <p className="text-sm text-orange-700">
                Transportation costs are 5% over budget. Consider carpooling or public transport.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
