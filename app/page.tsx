"use client"

import { useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { DollarSign, Info, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface Loan {
  id: string
  name: string
  amount: number
  rate: number
  payment: number
}

export default function LoanCalculator() {
  const [paymentStrategy, setPaymentStrategy] = useState("avalanche")
  const [monthlyPayment, setMonthlyPayment] = useState(500)
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: "1",
      name: "Loan 1",
      amount: 10000,
      rate: 5.0,
      payment: 200,
    },
  ])

  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const averageRate = loans.reduce((sum, loan) => sum + loan.rate * (loan.amount / totalPrincipal), 0)

  // Calculate months until paid off based on total debt and monthly payment
  const monthsUntilPaidOff = Math.ceil(totalPrincipal / monthlyPayment)
  const paidOffDate = new Date()
  paidOffDate.setMonth(paidOffDate.getMonth() + monthsUntilPaidOff)

  // Calculate total interest paid
  const totalInterest = (totalPrincipal * (averageRate / 100) * monthsUntilPaidOff) / 12

  // Generate chart data
  const labels = Array.from({ length: monthsUntilPaidOff + 1 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: "Principal Remaining",
        data: Array.from({ length: monthsUntilPaidOff + 1 }, (_, i) =>
          Math.max(totalPrincipal - monthlyPayment * i, 0),
        ),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  }

  const addLoan = () => {
    setLoans([
      ...loans,
      {
        id: Math.random().toString(),
        name: `Loan ${loans.length + 1}`,
        amount: 0,
        rate: 0,
        payment: 0,
      },
    ])
  }

  const updateLoan = (id: string, field: keyof Loan, value: number | string) => {
    setLoans(
      loans.map((loan) => (loan.id === id ? { ...loan, [field]: field === "name" ? value : Number(value) } : loan)),
    )
  }

  const removeLoan = (id: string) => {
    setLoans(loans.filter((loan) => loan.id !== id))
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payment Strategy</h2>
            <RadioGroup value={paymentStrategy} onValueChange={setPaymentStrategy}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avalanche" id="avalanche" />
                <Label htmlFor="avalanche">Highest Interest Rate (Avalanche)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snowball" id="snowball" />
                <Label htmlFor="snowball">Lowest Principal (Snowball)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Monthly Payment</h2>
              <span className="text-lg font-mono">${monthlyPayment}</span>
            </div>
            <Slider
              value={[monthlyPayment]}
              onValueChange={([value]) => setMonthlyPayment(value)}
              max={2000}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Loans</h2>
              <Button onClick={addLoan} variant="outline" size="sm">
                Add Loan
              </Button>
            </div>
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Input
                      value={loan.name}
                      onChange={(e) => updateLoan(loan.id, "name", e.target.value)}
                      className="w-[120px]"
                    />
                    <Button onClick={() => removeLoan(loan.id)} variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={loan.amount}
                          onChange={(e) => updateLoan(loan.id, "amount", e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Interest Rate</Label>
                      <div className="relative">
                        <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={loan.rate}
                          onChange={(e) => updateLoan(loan.id, "rate", e.target.value)}
                          className="pl-8"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Remaining</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalPrincipal.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total amount left to pay</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Off Date</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paidOffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </div>
                <p className="text-xs text-muted-foreground">{monthsUntilPaidOff} months to go</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalInterest.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total interest paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Weighted average interest rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

