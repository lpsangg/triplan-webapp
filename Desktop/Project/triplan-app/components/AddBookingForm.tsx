import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Booking } from "@/lib/types";

interface AddBookingFormProps {
  onSubmit: (booking: Omit<Booking, "id">) => void;
}

const bookingTypes = [
  { value: "flight", label: "Vé máy bay" },
  { value: "hotel", label: "Khách sạn" },
  { value: "car", label: "Thuê xe" },
  { value: "event", label: "Vé sự kiện" },
];

const AddBookingForm: React.FC<AddBookingFormProps> = ({ onSubmit }) => {
  const [type, setType] = useState<Booking["type"]>("flight");
  const [title, setTitle] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, title, confirmationCode, date, notes });
    setType("flight");
    setTitle("");
    setConfirmationCode("");
    setDate("");
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="booking-type">Loại đặt chỗ</Label>
        <Select value={type} onValueChange={(value: Booking["type"]) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bookingTypes.map((bookingType) => (
              <SelectItem key={bookingType.value} value={bookingType.value}>
                {bookingType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-title">Tiêu đề</Label>
        <Input
          id="booking-title"
          placeholder="VD: Chuyến bay HAN - SGN"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-code">Mã đặt chỗ</Label>
        <Input
          id="booking-code"
          placeholder="VD: ABC123"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-date">Ngày</Label>
        <Input id="booking-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking-notes">Ghi chú (tùy chọn)</Label>
        <Textarea
          id="booking-notes"
          placeholder="Thông tin bổ sung..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Thêm đặt chỗ
      </Button>
    </form>
  );
};

export default AddBookingForm; 