"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, DollarSign, Calculator, Receipt } from "lucide-react"

interface Participant {
  id: number
  name: string
  email: string
}

interface SplitExpense {
  id: number
  amount: number
  description: string
  paidBy: number
  splitBetween: number[]
  date: string
}

interface Settlement {
  from: number
  to: number
  amount: number
}

export default function ExpenseSplitting({ tripId }: { tripId: number }) {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: "Bạn", email: "you@example.com" },
    { id: 2, name: "Minh", email: "minh@example.com" },
    { id: 3, name: "Lan", email: "lan@example.com" },
  ])
  const [splitExpenses, setSplitExpenses] = useState<SplitExpense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])

  useEffect(() => {
    const savedExpenses = localStorage.getItem(`triplan_split_expenses_${tripId}`)
    if (savedExpenses) {
      setSplitExpenses(JSON.parse(savedExpenses))
    }
    calculateSettlements()
  }, [tripId])

  useEffect(() => {
    calculateSettlements()
  }, [splitExpenses, participants])

  const saveSplitExpenses = (expenses: SplitExpense[]) => {
    setSplitExpenses(expenses)
    localStorage.setItem(`triplan_split_expenses_${tripId}`, JSON.stringify(expenses))
  }

  const addSplitExpense = (expense: Omit<SplitExpense, "id">) => {
    const newExpense = { ...expense, id: Date.now() }
    saveSplitExpenses([...splitExpenses, newExpense])
  }

  const calculateSettlements = () => {
    const balances: Record<number, number> = {}

    // Initialize balances
    participants.forEach((p) => {
      balances[p.id] = 0
    })

    // Calculate balances
    splitExpenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length

      // Person who paid gets credited
      balances[expense.paidBy] += expense.amount

      // Everyone who should pay gets debited
      expense.splitBetween.forEach((personId) => {
        balances[personId] -= splitAmount
      })
    })

    // Calculate settlements
    const newSettlements: Settlement[] = []
    const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0)
    const debtors = Object.entries(balances).filter(([_, balance]) => balance < 0)

    creditors.forEach(([creditorId, creditAmount]) => {
      debtors.forEach(([debtorId, debtAmount]) => {
        if (creditAmount > 0 && debtAmount < 0) {
          const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount))
          if (settlementAmount > 0) {
            newSettlements.push({
              from: Number.parseInt(debtorId),
              to: Number.parseInt(creditorId),
              amount: settlementAmount,
            })
            balances[Number.parseInt(creditorId)] -= settlementAmount
            balances[Number.parseInt(debtorId)] += settlementAmount
          }
        }
      })
    })

    setSettlements(newSettlements)
  }

  const getParticipantName = (id: number) => {
    return participants.find((p) => p.id === id)?.name || "Unknown"
  }

  const getTotalExpenses = () => {
    return splitExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getPersonalExpenses = (personId: number) => {
    return splitExpenses
      .filter((expense) => expense.splitBetween.includes(personId))
      .reduce((sum, expense) => sum + expense.amount / expense.splitBetween.length, 0)
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-green-600" />
            <span>Chia Sẻ Chi Phí Thông Minh</span>
          </CardTitle>
          <CardDescription>Quản lý và chia sẻ chi phí nhóm một cách minh bạch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm text-blue-600 font-medium">Tổng chi phí</p>
              <p className="text-lg font-bold text-blue-700">{getTotalExpenses().toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Receipt className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-600 font-medium">Số hóa đơn</p>
              <p className="text-lg font-bold text-green-700">{splitExpenses.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-sm text-purple-600 font-medium">Thành viên</p>
              <p className="text-lg font-bold text-purple-700">{participants.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chi phí chung</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Thêm chi phí</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm chi phí chung</DialogTitle>
                </DialogHeader>
                <AddSplitExpenseForm participants={participants} onSubmit={addSplitExpense} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {splitExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có chi phí chung nào</p>
          ) : (
            <div className="space-y-4">
              {splitExpenses.map((expense) => (
                <div key={expense.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{expense.description}</h4>
                    <Badge variant="outline">{expense.amount.toLocaleString("vi-VN")} VNĐ</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Thanh toán bởi: <strong>{getParticipantName(expense.paidBy)}</strong>
                    </p>
                    <p>Chia cho: {expense.splitBetween.map((id) => getParticipantName(id)).join(", ")}</p>
                    <p>
                      Mỗi người:{" "}
                      <strong>{(expense.amount / expense.splitBetween.length).toLocaleString("vi-VN")} VNĐ</strong>
                    </p>
                    <p className="text-xs">{new Date(expense.date).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng kết cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{participant.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{getPersonalExpenses(participant.id).toLocaleString("vi-VN")} VNĐ</p>
                  <p className="text-sm text-gray-600">Chi phí cá nhân</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Thanh toán cuối chuyến đi</CardTitle>
            <CardDescription>Ai nợ ai bao nhiêu tiền</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getParticipantName(settlement.from).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>
                      <strong>{getParticipantName(settlement.from)}</strong> nợ{" "}
                      <strong>{getParticipantName(settlement.to)}</strong>
                    </span>
                  </div>
                  <Badge className="bg-green-600 text-white">{settlement.amount.toLocaleString("vi-VN")} VNĐ</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddSplitExpenseForm({
  participants,
  onSubmit,
}: {
  participants: Participant[]
  onSubmit: (expense: Omit<SplitExpense, "id">) => void
}) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [paidBy, setPaidBy] = useState<number>(participants[0]?.id || 1)
  const [splitBetween, setSplitBetween] = useState<number[]>([])
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSplitToggle = (participantId: number) => {
    setSplitBetween((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (splitBetween.length === 0) return

    onSubmit({
      amount: Number.parseFloat(amount),
      description,
      paidBy,
      splitBetween,
      date,
    })

    setAmount("")
    setDescription("")
    setSplitBetween([])
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="split-amount">Số tiền (VNĐ)</Label>
        <Input
          id="split-amount"
          type="number"
          placeholder="500000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="split-description">Mô tả</Label>
        <Input
          id="split-description"
          placeholder="VD: Ăn tối tại nhà hàng ABC"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paid-by">Người thanh toán</Label>
        <select
          id="paid-by"
          className="w-full border rounded-md px-3 py-2"
          value={paidBy}
          onChange={(e) => setPaidBy(Number.parseInt(e.target.value))}
        >
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Chia cho ai? (chọn nhiều)</Label>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <Checkbox
                id={`split-${participant.id}`}
                checked={splitBetween.includes(participant.id)}
                onCheckedChange={() => handleSplitToggle(participant.id)}
              />
              <Label htmlFor={`split-${participant.id}`} className="cursor-pointer">
                {participant.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="split-date">Ngày</Label>
        <Input id="split-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      {splitBetween.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Mỗi người sẽ trả:{" "}
            <strong>
              {amount ? (Number.parseFloat(amount) / splitBetween.length).toLocaleString("vi-VN") : 0} VNĐ
            </strong>
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={splitBetween.length === 0}>
        Thêm chi phí chung
      </Button>
    </form>
  )
}
