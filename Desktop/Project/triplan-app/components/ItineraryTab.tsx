import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Clock, MapPin, Trash2, UtensilsCrossed, Camera, Car, ShoppingBag, Hotel } from "lucide-react";
// Đảm bảo import các hàm, biến, type cần thiết từ trip-detail hoặc chuyển sang file utils nếu cần
// import { activityIcons } from "../app/trip-detail";
import AddActivityForm from "@/components/AddActivityForm";
import type { Trip, Activity } from "@/lib/types";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Định nghĩa lại các type cần thiết nếu chưa có sẵn
// Xóa các interface Trip, Activity định nghĩa nội bộ

interface ItineraryTabProps {
  trip: Trip;
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, "id">) => void;
  onDeleteActivity: (id: number) => void;
  onReorderActivities?: (day: number, newOrder: Activity[]) => void;
}

// Dummy activityIcons, cần thay thế bằng import thực tế nếu có
const activityIcons: any = {
  food: UtensilsCrossed,
  sightseeing: Camera,
  transport: Car,
  shopping: ShoppingBag,
  accommodation: Hotel,
};

// Dữ liệu mẫu cho gợi ý hoạt động
const SUGGESTED_ACTIVITIES: Record<string, { name: string; type: Activity["type"]; notes?: string }[]> = {
  "Hà Nội": [
    { name: "Tham quan Hồ Gươm", type: "sightseeing" },
    { name: "Ăn phở Bát Đàn", type: "food" },
    { name: "Tham quan Văn Miếu", type: "sightseeing" },
    { name: "Mua sắm tại chợ Đồng Xuân", type: "shopping" },
    { name: "Thưởng thức cà phê trứng", type: "food" },
  ],
  "Đà Nẵng": [
    { name: "Tham quan Bà Nà Hills", type: "sightseeing" },
    { name: "Tắm biển Mỹ Khê", type: "sightseeing" },
    { name: "Ăn mì Quảng", type: "food" },
    { name: "Tham quan cầu Rồng", type: "sightseeing" },
    { name: "Mua sắm tại chợ Hàn", type: "shopping" },
  ],
  // Thêm các địa điểm khác nếu muốn
};

function getTripDays(trip: Trip): Date[] {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days = [];
  let d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const ItineraryTab: React.FC<ItineraryTabProps> = ({ trip, activities, onAddActivity, onDeleteActivity, onReorderActivities }) => {
  const days = getTripDays(trip);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Lấy gợi ý theo điểm đến
  const suggestions = SUGGESTED_ACTIVITIES[trip.destination] || [];

  // Hàm thêm hoạt động từ gợi ý
  const handleAddSuggested = (suggestion: { name: string; type: Activity["type"]; notes?: string }, day: number) => {
    onAddActivity({
      name: suggestion.name,
      type: suggestion.type,
      notes: suggestion.notes,
      day,
    });
  };

  // Xử lý kéo thả
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Lấy ngày nguồn và đích từ droppableId
    const sourceDay = parseInt(result.source.droppableId.replace('droppable-day-', ''));
    const destDay = parseInt(result.destination.droppableId.replace('droppable-day-', ''));
    if (sourceDay !== destDay) return; // chỉ cho phép kéo trong cùng 1 ngày
    const dayActivities = activities.filter((a) => a.day === sourceDay);
    const reordered = Array.from(dayActivities);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    if (onReorderActivities) onReorderActivities(sourceDay, reordered);
  };

  return (
    <div className="space-y-6">
      {/* Gợi ý hoạt động tự động */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Gợi ý hoạt động tại {trip.destination}</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.length === 0 ? (
            <span className="text-gray-500">Chưa có gợi ý cho điểm đến này.</span>
          ) : (
            suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm border border-blue-300"
                onClick={() => setSelectedDay(idx + 1)}
                type="button"
              >
                {suggestion.name}
              </button>
            ))
          )}
        </div>
        {/* Popup chọn ngày khi thêm hoạt động từ gợi ý */}
        {selectedDay !== null && (
          <div className="mt-2 p-4 bg-white border rounded shadow">
            <div className="mb-2">Chọn ngày để thêm hoạt động: <b>{suggestions[selectedDay - 1]?.name}</b></div>
            <div className="flex gap-2 flex-wrap">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-xs border border-green-300"
                  onClick={() => {
                    handleAddSuggested(suggestions[selectedDay - 1], idx + 1);
                    setSelectedDay(null);
                  }}
                  type="button"
                >
                  Ngày {idx + 1} ({day.toLocaleDateString("vi-VN")})
                </button>
              ))}
              <button className="ml-2 text-red-500 text-xs" onClick={() => setSelectedDay(null)} type="button">Hủy</button>
            </div>
          </div>
        )}
      </div>
      {/* Lịch trình từng ngày */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {days.map((day, index) => {
          const dayNumber = index + 1;
          const dayActivities = activities.filter((a) => a.day === dayNumber);

          return (
            <Card key={dayNumber}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ngày {dayNumber}</CardTitle>
                    <CardDescription>
                      {day.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm hoạt động
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm hoạt động - Ngày {dayNumber}</DialogTitle>
                      </DialogHeader>
                      <AddActivityForm day={dayNumber} onSubmit={onAddActivity} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {dayActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có hoạt động nào cho ngày này</p>
                ) : (
                  <Droppable droppableId={`droppable-day-${dayNumber}`}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                        {dayActivities.map((activity, idx) => {
                          const IconComponent = activityIcons[activity.type];
                          return (
                            <Draggable key={activity.id} draggableId={activity.id.toString()} index={idx}>
                              {(dragProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300"
                                >
                                  <IconComponent className="h-5 w-5 text-blue-600 mt-1" />
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{activity.name}</h4>
                                    {activity.time && (
                                      <p className="text-sm text-gray-600 flex items-center mt-1">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {activity.time}
                                      </p>
                                    )}
                                    {activity.location && (
                                      <p className="text-sm text-gray-600 flex items-center mt-1">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {activity.location}
                                      </p>
                                    )}
                                    {activity.notes && <p className="text-sm text-gray-700 mt-2">{activity.notes}</p>}
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => onDeleteActivity(activity.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </CardContent>
            </Card>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default ItineraryTab; 