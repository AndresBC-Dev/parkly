export type VehicleType = "sedan" | "suv" | "motorcycle";

export type RateUnit = "minute" | "hour" | "fraction" | "day";
export type Currency = "USD" | "EUR" | "COP";

export interface Rate {
  id: string;
  vehicleType: VehicleType;
  unit: RateUnit;
  value: number;
  fractionMin?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  plates: string[];
  plan: "casual" | "monthly" | "vip";
  notes?: string;
  createdAt: Date;
}

export interface ParkedVehicle {
  plate: string;
  type: VehicleType;
  owner: string;
  customerId?: string;
  enteredAt: Date;
  rateSnapshot: Rate;
}

export interface Slot {
  id: string;
  label: string;
  zone: string;
  type: VehicleType;
  vehicle: ParkedVehicle | null;
}

export type MovementStatus = "active" | "completed" | "overdue";

export interface Movement {
  id: string;
  plate: string;
  type: VehicleType;
  owner: string;
  customerId?: string;
  slot: string;
  checkIn: Date;
  checkOut: Date | null;
  amount: number;
  status: MovementStatus;
  rateSnapshot: Rate;
}
