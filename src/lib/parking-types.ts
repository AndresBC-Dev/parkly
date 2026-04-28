export type VehicleType = "car" | "motorcycle";

export interface ParkedVehicle {
  plate: string;
  type: VehicleType;
  owner: string;
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
  slot: string;
  checkIn: Date;
  checkOut: Date | null;
  amount: number;
  status: MovementStatus;
}
