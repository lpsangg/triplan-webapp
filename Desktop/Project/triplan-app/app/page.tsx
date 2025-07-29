"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, DollarSign, Plane } from "lucide-react"
import Dashboard from "./dashboard"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem("triplan_user")
    if (user) {
      setCurrentUser(JSON.parse(user))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (email: string, password: string) => {
    // Simulate login - in real app, this would call an API
    const user = { email, name: email.split("@")[0], id: Date.now() }
    localStorage.setItem("triplan_user", JSON.stringify(user))
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const handleRegister = (name: string, email: string, password: string) => {
    // Simulate registration - in real app, this would call an API
    const user = { email, name, id: Date.now() }
    localStorage.setItem("triplan_user", JSON.stringify(user))
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  if (isLoggedIn) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem("triplan_user")
          setIsLoggedIn(false)
          setCurrentUser(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Triplan</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">Trợ lý du lịch cá nhân thông minh của bạn</p>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Lịch trình chi tiết</h3>
              <p className="text-sm text-gray-600">Tổ chức hoạt động theo từng ngày</p>
            </div>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Bản đồ tích hợp</h3>
              <p className="text-sm text-gray-600">Xem địa điểm trên bản đồ</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold">Quản lý ngân sách</h3>
              <p className="text-sm text-gray-600">Theo dõi chi tiêu du lịch</p>
            </div>
            <div className="text-center">
              <Plane className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Quản lý đặt chỗ</h3>
              <p className="text-sm text-gray-600">Lưu trữ thông tin đặt chỗ</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Chào mừng đến với Triplan</CardTitle>
              <CardDescription>Đăng nhập hoặc tạo tài khoản để bắt đầu lập kế hoạch du lịch</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                  <TabsTrigger value="register">Đăng ký</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <LoginForm onLogin={handleLogin} />
                </TabsContent>

                <TabsContent value="register">
                  <RegisterForm onRegister={handleRegister} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full">
        Đăng nhập
      </Button>

      <Separator />

      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full bg-transparent">
          Đăng nhập với Google
        </Button>
        <Button type="button" variant="outline" className="w-full bg-transparent">
          Đăng nhập với Facebook
        </Button>
      </div>
    </form>
  )
}

function RegisterForm({ onRegister }: { onRegister: (name: string, email: string, password: string) => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!")
      return
    }
    onRegister(name, email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên hiển thị</Label>
        <Input
          id="name"
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Mật khẩu</Label>
        <Input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Đăng ký
      </Button>
    </form>
  )
}
