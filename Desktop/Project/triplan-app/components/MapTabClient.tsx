import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Trip, Activity } from "@/lib/types";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

interface MapTabProps {
  activities: Activity[];
  trip: Trip;
}

// Hàm lấy toạ độ từ Nominatim API
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

const defaultCenter: [number, number] = [21.0285, 105.8542]; // Hà Nội

// Màu marker theo loại hoạt động
const markerColors: Record<Activity["type"], string> = {
  food: "#e74c3c",
  sightseeing: "#2980b9",
  transport: "#27ae60",
  shopping: "#f1c40f",
  accommodation: "#8e44ad",
};

function getTripDays(trip: Trip): number[] {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days = [];
  let d = new Date(start);
  let dayNum = 1;
  while (d <= end) {
    days.push(dayNum);
    d.setDate(d.getDate() + 1);
    dayNum++;
  }
  return days;
}

const MapTab: React.FC<MapTabProps> = ({ activities, trip }) => {
  const days = getTripDays(trip);
  const [selectedDay, setSelectedDay] = useState<number>(days[0]);
  const [markers, setMarkers] = useState<{ id: number; name: string; coords: [number, number]; type: Activity["type"] }[]>([]);
  const [polyline, setPolyline] = useState<[number, number][]>([]);

  // Lọc hoạt động theo ngày
  const filteredActivities = activities.filter(a => a.day === selectedDay);

  useEffect(() => {
    let isMounted = true;
    async function fetchCoords() {
      const results: { id: number; name: string; coords: [number, number]; type: Activity["type"] }[] = [];
      const poly: [number, number][] = [];
      const filtered = activities.filter(a => a.day === selectedDay);
      for (const act of filtered) {
        if (act.location) {
          const coords = await geocodeLocation(act.location);
          if (coords) {
            results.push({ id: act.id, name: act.name, coords, type: act.type });
            poly.push(coords);
          }
        }
      }
      if (isMounted) {
        setMarkers(results);
        setPolyline(poly);
      }
    }
    fetchCoords();
    return () => { isMounted = false; };
  }, [selectedDay, activities]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bản đồ chuyến đi</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Dropdown chọn ngày */}
          <div className="mb-4 flex items-center gap-2">
            <span>Chọn ngày:</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedDay}
              onChange={e => setSelectedDay(Number(e.target.value))}
            >
              {days.map(day => (
                <option key={day} value={day}>Ngày {day}</option>
              ))}
            </select>
          </div>
          <div className="w-full h-[400px]">
            <MapContainer center={markers[0]?.coords || defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Vẽ polyline nối các điểm */}
              {polyline.length > 1 && (
                <Polyline positions={polyline} color="#2ecc71" />
              )}
              {/* Marker cho từng hoạt động */}
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.coords}
                  icon={L.divIcon({
                    className: "custom-marker",
                    html: `<div style='background:${markerColors[marker.type]};width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px #333;'></div>`
                  })}
                >
                  <Popup>
                    <b>{marker.name}</b><br />
                    <span style={{ color: markerColors[marker.type] }}>Loại: {marker.type}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapTab; 