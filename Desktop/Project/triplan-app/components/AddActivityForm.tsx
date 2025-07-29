import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Activity } from "@/lib/types";

interface AddActivityFormProps {
  day: number;
  onSubmit: (activity: Omit<Activity, "id">) => void;
}

const activityTypes = [
  { value: "food", label: "Ẩm thực" },
  { value: "sightseeing", label: "Tham quan" },
  { value: "transport", label: "Di chuyển" },
  { value: "shopping", label: "Mua sắm" },
  { value: "accommodation", label: "Chỗ ở" },
];

const AddActivityForm: React.FC<AddActivityFormProps> = ({ day, onSubmit }) => {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<Activity["type"]>("sightseeing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, time, location, notes, type, day });
    setName("");
    setTime("");
    setLocation("");
    setNotes("");
    setType("sightseeing");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activity-name">Tên hoạt động</Label>
        <Input
          id="activity-name"
          placeholder="VD: Ăn trưa tại Bún chả Hương Liên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-type">Loại hoạt động</Label>
        <Select value={type} onValueChange={(value: Activity["type"]) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((actType) => (
              <SelectItem key={actType.value} value={actType.value}>
                {actType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-time">Thời gian (tùy chọn)</Label>
        <Input id="activity-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-location">Địa điểm (tùy chọn)</Label>
        <Input
          id="activity-location"
          placeholder="VD: 24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity-notes">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="activity-notes"
          placeholder="Mã đặt chỗ, link tham khảo, lưu ý..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Thêm hoạt động
      </Button>
    </form>
  );
};

export default AddActivityForm; 