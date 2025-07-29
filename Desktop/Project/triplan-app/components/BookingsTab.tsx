import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Plane, Hotel, Car, Ticket } from "lucide-react";
import AddBookingForm from "@/components/AddBookingForm";
import type { Booking } from "@/lib/types";

interface BookingsTabProps {
  bookings: Booking[];
  onAddBooking: (booking: Omit<Booking, "id">) => void;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onAddBooking }) => {
  const bookingIcons: Record<string, React.ElementType> = {
    flight: Plane,
    hotel: Hotel,
    car: Car,
    event: Ticket,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý đặt chỗ</CardTitle>
              <CardDescription>Lưu trữ tất cả thông tin đặt chỗ của bạn</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm đặt chỗ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm thông tin đặt chỗ</DialogTitle>
                </DialogHeader>
                <AddBookingForm onSubmit={onAddBooking} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có thông tin đặt chỗ nào</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const IconComponent = bookingIcons[booking.type];
                return (
                  <div key={booking.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{booking.title}</h4>
                      <p className="text-sm text-gray-600">Mã đặt chỗ: {booking.confirmationCode}</p>
                      <p className="text-sm text-gray-600">
                        Ngày: {new Date(booking.date).toLocaleDateString("vi-VN")}
                      </p>
                      {booking.notes && <p className="text-sm text-gray-700 mt-2">{booking.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsTab; 