"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, Clock, Zap, ArrowRight } from "lucide-react"

interface Activity {
  id: number
  name: string
  location?: string
  time?: string
  type: string
}

interface OptimizedRoute {
  originalOrder: Activity[]
  optimizedOrder: Activity[]
  timeSaved: number
  distanceSaved: number
}

export default function RouteOptimizer({
  activities,
  onOptimize,
}: {
  activities: Activity[]
  onOptimize: (optimizedActivities: Activity[]) => void
}) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null)

  const optimizeRoute = async () => {
    setIsOptimizing(true)

    // Simulate route optimization algorithm
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock optimization logic - in real app, this would use Google Maps API
    const activitiesWithLocation = activities.filter((a) => a.location)
    const shuffled = [...activitiesWithLocation].sort(() => Math.random() - 0.5)

    const result: OptimizedRoute = {
      originalOrder: activitiesWithLocation,
      optimizedOrder: shuffled,
      timeSaved: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
      distanceSaved: Math.floor(Math.random() * 10) + 2, // 2-12 km
    }

    setOptimizedRoute(result)
    setIsOptimizing(false)
  }

  const applyOptimization = () => {
    if (optimizedRoute) {
      onOptimize(optimizedRoute.optimizedOrder)
      setOptimizedRoute(null)
    }
  }

  if (activities.filter((a) => a.location).length < 2) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Cần ít nhất 2 địa điểm</h3>
          <p className="text-gray-600">Thêm địa điểm vào các hoạt động để sử dụng tính năng tối ưu hóa lộ trình</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>Tối Ưu Hóa Lộ Trình</span>
          </CardTitle>
          <CardDescription>
            AI sẽ sắp xếp lại thứ tự các địa điểm để tiết kiệm thời gian và chi phí di chuyển
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!optimizedRoute && (
            <Button onClick={optimizeRoute} disabled={isOptimizing} className="w-full">
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tối ưu hóa...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Tối ưu hóa lộ trình
                </>
              )}
            </Button>
          )}

          {optimizedRoute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-600 font-medium">Tiết kiệm</p>
                  <p className="text-lg font-bold text-green-700">{optimizedRoute.timeSaved} phút</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-blue-600 font-medium">Giảm quãng đường</p>
                  <p className="text-lg font-bold text-blue-700">{optimizedRoute.distanceSaved} km</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Thứ tự hiện tại:</h4>
                  <div className="space-y-2">
                    {optimizedRoute.originalOrder.map((activity, index) => (
                      <div key={activity.id} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="flex-1">{activity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Thứ tự được tối ưu:</h4>
                  <div className="space-y-2">
                    {optimizedRoute.optimizedOrder.map((activity, index) => (
                      <div key={activity.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <Badge variant="default">{index + 1}</Badge>
                        <span className="flex-1">{activity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setOptimizedRoute(null)} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={applyOptimization} className="flex-1">
                  Áp dụng tối ưu hóa
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
