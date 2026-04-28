export type VehicleType = "car" | "motorcycle";

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
}
