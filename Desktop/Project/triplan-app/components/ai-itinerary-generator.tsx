"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Sparkles, MapPin, Clock, DollarSign, Heart } from "lucide-react"

interface AIItineraryRequest {
  destination: string
  days: number
  budget: "low" | "medium" | "high"
  interests: string[]
  pace: "relaxed" | "moderate" | "packed"
  travelStyle: string[]
  additionalNotes?: string
}

const interests = [
  { id: "food", label: "Ẩm thực", icon: "🍽️" },
  { id: "history", label: "Lịch sử", icon: "🏛️" },
  { id: "nature", label: "Thiên nhiên", icon: "🌿" },
  { id: "adventure", label: "Mạo hiểm", icon: "🏔️" },
  { id: "shopping", label: "Mua sắm", icon: "🛍️" },
  { id: "nightlife", label: "Cuộc sống về đêm", icon: "🌃" },
  { id: "culture", label: "Văn hóa", icon: "🎭" },
  { id: "photography", label: "Nhiếp ảnh", icon: "📸" },
  { id: "wellness", label: "Sức khỏe", icon: "🧘" },
  { id: "beach", label: "Biển", icon: "🏖️" },
]

const travelStyles = [
  { id: "backpacker", label: "Phượt thủ" },
  { id: "luxury", label: "Cao cấp" },
  { id: "family", label: "Gia đình" },
  { id: "couple", label: "Cặp đôi" },
  { id: "solo", label: "Một mình" },
  { id: "group", label: "Nhóm bạn" },
]

// Helper: lấy key động và itinerary từ object AI trả về
function extractItinerary(aiObj: any) {
  if (!aiObj || typeof aiObj !== "object") return { tripKey: null, itinerary: null };
  const tripKey = Object.keys(aiObj)[0];
  const itinerary = aiObj[tripKey]?.itinerary || null;
  return { tripKey, itinerary };
}

export default function AIItineraryGenerator({
  onSubmit,
}: {
  onSubmit: (name: string, destination: string, startDate: string, endDate: string) => void
}) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null)
  const [formData, setFormData] = useState<AIItineraryRequest>({
    destination: "",
    days: 3,
    budget: "medium",
    interests: [],
    pace: "moderate",
    travelStyle: [],
    additionalNotes: "",
  })

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }))
  }

  const handleTravelStyleToggle = (styleId: string) => {
    setFormData((prev) => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(styleId)
        ? prev.travelStyle.filter((id) => id !== styleId)
        : [...prev.travelStyle, styleId],
    }))
  }

  const generateItinerary = async () => {
    setIsGenerating(true);

    // Tạo prompt động từ formData
    const prompt = `Lên lịch trình du lịch hoàn chỉnh cho ${formData.days} ngày tại ${formData.destination}.
Ngân sách: ${formData.budget} VNĐ.
Nhịp độ chuyến đi: ${formData.pace}.
Sở thích: ${formData.interests.join(", ")}.
Phong cách: ${formData.travelStyle.join(", ")}.
Ghi chú: ${formData.additionalNotes || "Không"}.
Hãy phân bổ lịch trình hợp lý, đa dạng, phù hợp ngân sách và nhịp độ.
Trả về kết quả dạng JSON, mỗi ngày là một mảng hoạt động (tên, loại, thời gian, gợi ý ăn uống/nghỉ ngơi).`;

    // Gọi API backend
    const res = await fetch("/api/ai-itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    let aiResult = data.result;
    let itinerary = null;
    console.log('AI raw result:', aiResult); // DEBUG
    try {
      itinerary = JSON.parse(aiResult);
    } catch {
      // Nếu không phải JSON, hiển thị text
      itinerary = aiResult;
    }
    console.log('Parsed itinerary:', itinerary); // DEBUG
    setGeneratedItinerary(itinerary);
    setIsGenerating(false);
    setStep(3);
  };

  const generateDayActivities = (data: AIItineraryRequest, day: number) => {
    const activities = []

    // Morning activity
    if (data.interests.includes("food")) {
      activities.push({
        time: "08:00",
        name: `Ăn sáng tại quán địa phương nổi tiếng`,
        type: "food",
        location: `${data.destination}`,
        duration: "1 giờ",
        cost: data.budget === "low" ? 50000 : data.budget === "medium" ? 100000 : 200000,
      })
    }

    // Main sightseeing
    if (data.interests.includes("history")) {
      activities.push({
        time: "09:30",
        name: `Tham quan di tích lịch sử ${data.destination}`,
        type: "sightseeing",
        location: `Trung tâm ${data.destination}`,
        duration: "2.5 giờ",
        cost: data.budget === "low" ? 100000 : data.budget === "medium" ? 200000 : 300000,
      })
    }

    // Lunch
    activities.push({
      time: "12:30",
      name: "Ăn trưa món đặc sản địa phương",
      type: "food",
      location: `${data.destination}`,
      duration: "1 giờ",
      cost: data.budget === "low" ? 100000 : data.budget === "medium" ? 200000 : 400000,
    })

    // Afternoon activity
    if (data.interests.includes("nature")) {
      activities.push({
        time: "14:00",
        name: `Khám phá thiên nhiên xung quanh ${data.destination}`,
        type: "nature",
        location: `Ngoại ô ${data.destination}`,
        duration: "3 giờ",
        cost: data.budget === "low" ? 150000 : data.budget === "medium" ? 300000 : 500000,
      })
    }

    // Shopping
    if (data.interests.includes("shopping")) {
      activities.push({
        time: "17:30",
        name: "Mua sắm tại chợ/trung tâm thương mại",
        type: "shopping",
        location: `${data.destination}`,
        duration: "1.5 giờ",
        cost: data.budget === "low" ? 200000 : data.budget === "medium" ? 500000 : 1000000,
      })
    }

    return activities
  }

  // Khi người dùng chọn "Tạo chuyến đi mới" từ kết quả AI
  const handleCreateTrip = () => {
    if (generatedItinerary && typeof generatedItinerary === "object") {
      const { tripKey, itinerary } = extractItinerary(generatedItinerary);
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + (formData.days - 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      onSubmit(
        tripKey && generatedItinerary[tripKey]?.tripName ? generatedItinerary[tripKey].tripName : `Chuyến đi AI ${formData.destination}`,
        formData.destination,
        startDate,
        endDate
      );
      // Lưu hoạt động vào localStorage
      setTimeout(() => {
        const tripId = Date.now();
        const activities = Array.isArray(itinerary)
          ? itinerary.flatMap((day: any) =>
              (day.activities || []).map((activity: any, index: number) => ({
                id: Date.now() + index,
                name: activity.name,
                time: activity.time,
                location: activity.location,
                notes: activity.notes || "",
                type: activity.type || "sightseeing",
                day: day.day,
              }))
            )
          : [];
        localStorage.setItem(`triplan_activities_${tripId}`, JSON.stringify(activities));
      }, 100);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Điểm đến</Label>
            <Input
              id="destination"
              placeholder="VD: Đà Nẵng, Hà Nội, Tokyo..."
              value={formData.destination}
              onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Số ngày</Label>
              <Select
                value={formData.days.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, days: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} ngày
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Ngân sách</Label>
              <Select
                value={formData.budget}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, budget: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Tiết kiệm</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nhịp độ chuyến đi</Label>
            <Select
              value={formData.pace}
              onValueChange={(value: "relaxed" | "moderate" | "packed") =>
                setFormData((prev) => ({ ...prev, pace: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Thư thả</SelectItem>
                <SelectItem value="moderate">Vừa phải</SelectItem>
                <SelectItem value="packed">Dày đặc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.destination}>
          Tiếp theo: Chọn sở thích
        </Button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Sở thích của bạn (chọn nhiều)</Label>
            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <div key={interest.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest.id}
                    checked={formData.interests.includes(interest.id)}
                    onCheckedChange={() => handleInterestToggle(interest.id)}
                  />
                  <Label htmlFor={interest.id} className="flex items-center space-x-2 cursor-pointer">
                    <span>{interest.icon}</span>
                    <span>{interest.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Phong cách du lịch</Label>
            <div className="grid grid-cols-2 gap-3">
              {travelStyles.map((style) => (
                <div key={style.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={style.id}
                    checked={formData.travelStyle.includes(style.id)}
                    onCheckedChange={() => handleTravelStyleToggle(style.id)}
                  />
                  <Label htmlFor={style.id} className="cursor-pointer">
                    {style.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú thêm (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="VD: Tôi muốn tránh đồ ăn cay, thích các hoạt động ngoài trời..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Quay lại
          </Button>
          <Button onClick={generateItinerary} className="flex-1" disabled={formData.interests.length === 0}>
            <Sparkles className="h-4 w-4 mr-2" />
            Tạo lịch trình AI
          </Button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    if (isGenerating) {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="space-y-4">
            <Brain className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">AI đang tạo lịch trình cho bạn...</h3>
              <p className="text-gray-600">Đang phân tích sở thích và tối ưu hóa lộ trình</p>
            </div>
            <Progress value={66} className="w-full" />
          </div>
        </div>
      )
    }

    if (generatedItinerary) {
      const { tripKey, itinerary } = extractItinerary(generatedItinerary);
      return (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-green-600">✨ Lịch trình đã được tạo!</h3>
            <p className="text-gray-600">Dưới đây là gợi ý hoàn chỉnh cho chuyến đi của bạn</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tripKey ? generatedItinerary[tripKey]?.tripName : ""}</span>
                <Badge variant="outline">
                  {tripKey && typeof generatedItinerary[tripKey]?.totalBudget === "number"
                    ? `${generatedItinerary[tripKey].totalBudget.toLocaleString("vi-VN")} VNĐ`
                    : "Không rõ ngân sách"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {formData.days} ngày tại {formData.destination}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {tripKey && Array.isArray(itinerary) ? (
              itinerary.map((day: any) => (
                <Card key={day.day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Ngày {day.day}</CardTitle>
                    <CardDescription>{day.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {day.activities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-600 min-w-[60px]">{activity.time}</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {activity.location}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.duration}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {activity.cost.toLocaleString("vi-VN")} VNĐ
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-red-500">Không có dữ liệu lịch trình hợp lệ từ AI.</div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              Tạo lại
            </Button>
            <Button onClick={handleCreateTrip} className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              Lưu lịch trình này
            </Button>
          </div>
        </div>
      )
    }
  }

  return null
}
