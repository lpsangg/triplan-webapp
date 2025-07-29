export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
}

export interface Activity {
  id: number;
  name: string;
  time?: string;
  location?: string;
  notes?: string;
  type: "food" | "sightseeing" | "transport" | "shopping" | "accommodation";
  day: number;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Booking {
  id: number;
  type: "flight" | "hotel" | "car" | "event";
  title: string;
  confirmationCode: string;
  date: string;
  notes?: string;
} 