"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  Trash2,
  Plane,
  Hotel,
  Car,
  Ticket,
  UtensilsCrossed,
  Camera,
  ShoppingBag,
} from "lucide-react"
import RouteOptimizer from "../components/route-optimizer"
import CollaborativePlanning from "../components/collaborative-planning"
// Add ExpenseSplitting import at the top
import ExpenseSplitting from "../components/expense-splitting"
import ItineraryTab from "@/components/ItineraryTab";
import MapTab from "@/components/MapTab";
import BudgetTab from "@/components/BudgetTab";
import BookingsTab from "@/components/BookingsTab";
import type { Trip, Activity, Expense, Booking } from "@/lib/types";

const activityIcons = {
  food: UtensilsCrossed,
  sightseeing: Camera,
  transport: Car,
  shopping: ShoppingBag,
  accommodation: Hotel,
}

const activityTypes = [
  { value: "food", label: "Ẩm thực" },
  { value: "sightseeing", label: "Tham quan" },
  { value: "transport", label: "Di chuyển" },
  { value: "shopping", label: "Mua sắm" },
  { value: "accommodation", label: "Chỗ ở" },
]

export default function TripDetail({
  trip,
  onBack,
  onUpdate,
}: {
  trip: Trip
  onBack: () => void
  onUpdate: (trip: Trip) => void
}) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [budget, setBudget] = useState(0)
  const [activeTab, setActiveTab] = useState("itinerary")

  useEffect(() => {
    // Load trip data from localStorage
    const savedActivities = localStorage.getItem(`triplan_activities_${trip.id}`)
    const savedExpenses = localStorage.getItem(`triplan_expenses_${trip.id}`)
    const savedBookings = localStorage.getItem(`triplan_bookings_${trip.id}`)
    const savedBudget = localStorage.getItem(`triplan_budget_${trip.id}`)

    if (savedActivities) setActivities(JSON.parse(savedActivities))
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
    if (savedBookings) setBookings(JSON.parse(savedBookings))
    if (savedBudget) setBudget(JSON.parse(savedBudget))
  }, [trip.id])

  const saveActivities = (newActivities: Activity[]) => {
    setActivities(newActivities)
    localStorage.setItem(`triplan_activities_${trip.id}`, JSON.stringify(newActivities))
  }

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    localStorage.setItem(`triplan_expenses_${trip.id}`, JSON.stringify(newExpenses))
  }

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings)
    localStorage.setItem(`triplan_bookings_${trip.id}`, JSON.stringify(newBookings))
  }

  const saveBudget = (newBudget: number) => {
    setBudget(newBudget)
    localStorage.setItem(`triplan_budget_${trip.id}`, JSON.stringify(newBudget))
  }

  const getTripDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    let d = new Date(start);
    while (d <= end) {
      days.push(new Date(d)); // tạo object mới
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = { ...activity, id: Date.now() }
    saveActivities([...activities, newActivity])
  }

  const deleteActivity = (activityId: number) => {
    saveActivities(activities.filter((a) => a.id !== activityId))
  }

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: Date.now() }
    saveExpenses([...expenses, newExpense])
  }

  const addBooking = (booking: Omit<Booking, "id">) => {
    const newBooking = { ...booking, id: Date.now() }
    saveBookings([...bookings, newBooking])
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetProgress = budget > 0 ? (totalExpenses / budget) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {trip.destination}
                </p>
              </div>
            </div>
            <Badge variant="outline">
              {new Date(trip.startDate).toLocaleDateString("vi-VN")} -{" "}
              {new Date(trip.endDate).toLocaleDateString("vi-VN")}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
            <TabsTrigger value="map">Bản đồ</TabsTrigger>
            <TabsTrigger value="budget">Ngân sách</TabsTrigger>
            <TabsTrigger value="bookings">Đặt chỗ</TabsTrigger>
            <TabsTrigger value="collaborate">Cộng tác</TabsTrigger>
            <TabsTrigger value="optimize">Tối ưu</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="space-y-6">
            <ItineraryTab
              trip={trip}
              activities={activities}
              onAddActivity={addActivity}
              onDeleteActivity={deleteActivity}
              onReorderActivities={(day, newOrder) => {
                // Giữ nguyên activities của các ngày khác, chỉ cập nhật lại thứ tự cho ngày này
                const other = activities.filter(a => a.day !== day);
                saveActivities([...other, ...newOrder]);
              }}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <MapTab activities={activities} trip={trip} />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetTab
              trip={trip}
              budget={budget}
              expenses={expenses}
              totalExpenses={totalExpenses}
              budgetProgress={budgetProgress}
              onSetBudget={saveBudget}
              onAddExpense={addExpense}
            />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <BookingsTab bookings={bookings} onAddBooking={addBooking} />
          </TabsContent>

          <TabsContent value="collaborate" className="space-y-6">
            <CollaborativePlanning tripId={trip.id} currentUser={{ id: 1, name: "Bạn", email: "user@example.com" }} />
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <RouteOptimizer
              activities={activities}
              onOptimize={(optimizedActivities) => {
                // Update activities with optimized order
                const updatedActivities = activities.map((activity) => {
                  const optimizedActivity = optimizedActivities.find((opt) => opt.id === activity.id)
                  return optimizedActivity || activity
                })
                saveActivities(updatedActivities)
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
