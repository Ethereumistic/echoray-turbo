"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card"
import { Badge } from "@repo/design-system/components/ui/badge"
import { Progress } from "@repo/design-system/components/ui/progress"
import {
  BrainIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LightbulbIcon,
  CalendarIcon,
  DollarSignIcon,
} from "lucide-react"

export function FinancialInsights() {
  const insights = [
    {
      type: "positive",
      title: "Excellent Savings Rate",
      description: "Your 26.2% savings rate is above the recommended 20%. Keep up the great work!",
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      type: "warning",
      title: "Transportation Overspend",
      description: "You've spent 5% more on transportation this month. Consider carpooling or public transit.",
      icon: AlertTriangleIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      type: "suggestion",
      title: "Investment Opportunity",
      description: "With your current savings rate, you could invest an additional $300/month.",
      icon: LightbulbIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ]

  const predictions = [
    {
      metric: "Net Worth",
      current: 24580,
      predicted: 32400,
      timeframe: "6 months",
      confidence: 85,
      trend: "up",
    },
    {
      metric: "Emergency Fund",
      current: 7500,
      predicted: 10000,
      timeframe: "4 months",
      confidence: 92,
      trend: "up",
    },
    {
      metric: "Monthly Expenses",
      current: 3840,
      predicted: 3650,
      timeframe: "3 months",
      confidence: 78,
      trend: "down",
    },
  ]

  const financialHealth = {
    score: 82,
    factors: [
      { name: "Savings Rate", score: 95, status: "excellent" },
      { name: "Debt-to-Income", score: 88, status: "good" },
      { name: "Emergency Fund", score: 75, status: "good" },
      { name: "Investment Diversity", score: 65, status: "fair" },
      { name: "Budget Adherence", score: 90, status: "excellent" },
    ],
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-blue-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-5 w-5" />
            Financial Health Score
          </CardTitle>
          <CardDescription>AI-powered analysis of your overall financial wellness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${financialHealth.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{financialHealth.score}</div>
                    <div className="text-xs text-muted-foreground">Excellent</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {financialHealth.factors.map((factor) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(factor.score)}`}>{factor.score}</span>
                      <Badge variant="secondary" className="text-xs">
                        {factor.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={factor.score} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized recommendations based on your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon

              return (
                <div key={index} className={`p-4 rounded-lg ${insight.bgColor} border ${insight.borderColor}`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-5 w-5 ${insight.color} mt-0.5`} />
                    <div>
                      <div className={`font-medium ${insight.color}`}>{insight.title}</div>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Financial Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Predictions</CardTitle>
            <CardDescription>AI-powered forecasts based on current trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictions.map((prediction, index) => {
              const TrendIcon = prediction.trend === "up" ? TrendingUpIcon : TrendingDownIcon
              const trendColor = prediction.trend === "up" ? "text-green-600" : "text-red-600"

              return (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{prediction.metric}</div>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: ${prediction.current.toLocaleString()}</span>
                      <span>Predicted: ${prediction.predicted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>In {prediction.timeframe}</span>
                      <span>{prediction.confidence}% confidence</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-1" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Monthly Forecast
          </CardTitle>
          <CardDescription>Projected financial performance for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSignIcon className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Expected Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-800">$8,160</div>
              <div className="text-sm text-green-600">Next 6 months</div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Income Growth</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">+12%</div>
              <div className="text-sm text-blue-600">Projected increase</div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDownIcon className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Expense Reduction</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">-5%</div>
              <div className="text-sm text-purple-600">Through optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
