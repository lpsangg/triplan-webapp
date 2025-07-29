"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MapPin, Calendar, Settings, LogOut, MoreVertical, Edit, Trash2, Sparkles, Brain } from "lucide-react"
import TripDetail from "./trip-detail"
import AIItineraryGeneratorComponent from "../components/ai-itinerary-generator"

interface Trip {
  id: number
  name: string
  destination: string
  startDate: string
  endDate: string
  status: "upcoming" | "ongoing" | "completed"
  image?: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    const savedTrips = localStorage.getItem(`triplan_trips_${user.id}`)
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips))
    }
  }, [user.id])

  const saveTrips = (newTrips: Trip[]) => {
    setTrips(newTrips)
    localStorage.setItem(`triplan_trips_${user.id}`, JSON.stringify(newTrips))
  }

  const createTrip = (name: string, destination: string, startDate: string, endDate: string) => {
    const newTrip: Trip = {
      id: Date.now(),
      name,
      destination,
      startDate,
      endDate,
      status: new Date(startDate) > new Date() ? "upcoming" : new Date(endDate) < new Date() ? "completed" : "ongoing",
    }
    saveTrips([...trips, newTrip])
    setIsCreateDialogOpen(false)
  }

  const deleteTrip = (tripId: number) => {
    saveTrips(trips.filter((trip) => trip.id !== tripId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Sắp tới</Badge>
      case "ongoing":
        return <Badge variant="default">Đang diễn ra</Badge>
      case "completed":
        return <Badge variant="outline">Đã kết thúc</Badge>
      default:
        return null
    }
  }

  // Thay thế hàm formatDate để chỉ định dạng ngày ở client
  function useClientDate(dateString: string) {
    const [date, setDate] = useState("");
    useEffect(() => {
      setDate(new Date(dateString).toLocaleDateString("vi-VN"));
    }, [dateString]);
    return date;
  }

  // Chỉ dùng useClientDate cho selectedTrip (khi xem chi tiết)
  let formattedStartDate = "";
  let formattedEndDate = "";
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  useEffect(() => {
    if (selectedTrip) {
      setStart(new Date(selectedTrip.startDate).toLocaleDateString("vi-VN"));
      setEnd(new Date(selectedTrip.endDate).toLocaleDateString("vi-VN"));
    } else {
      setStart("");
      setEnd("");
    }
  }, [selectedTrip]);

  if (selectedTrip) {
    return (
      <TripDetail
        trip={selectedTrip}
        onBack={() => setSelectedTrip(null)}
        onUpdate={(updatedTrip) => {
          const updatedTrips = trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip))
          saveTrips(updatedTrips)
          setSelectedTrip(updatedTrip)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Triplan</h1>
              <Badge variant="outline">Dashboard</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Chuyến đi của bạn</h2>
            <p className="text-gray-600 mt-2">Quản lý và theo dõi tất cả các kế hoạch du lịch</p>
          </div>

          <div className="flex items-center space-x-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Tạo chuyến đi mới</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo chuyến đi mới</DialogTitle>
                  <DialogDescription>Nhập thông tin cơ bản cho chuyến đi của bạn</DialogDescription>
                </DialogHeader>
                <CreateTripForm onSubmit={createTrip} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Tạo lịch trình</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>AI Lên Lịch Trình Tự Động</span>
                  </DialogTitle>
                  <DialogDescription>Để AI tạo lịch trình hoàn chỉnh cho bạn chỉ trong vài giây</DialogDescription>
                </DialogHeader>
                <AIItineraryGeneratorComponent onSubmit={createTrip} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Trip Categories */}
        <div className="space-y-8">
          {["upcoming", "ongoing", "completed"].map((status) => {
            const categoryTrips = trips.filter((trip) => trip.status === status)
            const categoryTitle =
              status === "upcoming" ? "Sắp tới" : status === "ongoing" ? "Đang diễn ra" : "Đã kết thúc"

            if (categoryTrips.length === 0) return null

            return (
              <div key={status}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{categoryTitle}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTrips.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{trip.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {trip.destination}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTrip(trip)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteTrip(trip.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(trip.startDate).toLocaleDateString("vi-VN")} - {new Date(trip.endDate).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(trip.status)}
                            <Button variant="outline" size="sm" onClick={() => setSelectedTrip(trip)}>
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu lập kế hoạch cho chuyến đi đầu tiên của bạn</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo chuyến đi đầu tiên
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function CreateTripForm({
  onSubmit,
}: { onSubmit: (name: string, destination: string, startDate: string, endDate: string) => void }) {
  const [name, setName] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name, destination, startDate, endDate)
    setName("")
    setDestination("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trip-name">Tên chuyến đi</Label>
        <Input
          id="trip-name"
          placeholder="VD: Khám phá Đà Nẵng - Hội An"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="destination">Điểm đến chính</Label>
        <Input
          id="destination"
          placeholder="VD: Đà Nẵng, Việt Nam"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Ngày bắt đầu</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">Ngày kết thúc</Label>
          <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Tạo chuyến đi
      </Button>
    </form>
  )
}
