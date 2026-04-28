import { create } from "zustand";
import type { Slot, Movement, VehicleType, ParkedVehicle } from "./parking-types";

const ZONES = ["A", "B", "C"] as const;
const SLOTS_PER_ZONE = 16;

const SAMPLE_PLATES = [
  "MAD-2841", "BCN-9027", "VAL-1156", "SEV-7710", "BIL-3392",
  "MUR-0048", "MAL-6621", "ZAR-4407", "GRA-8853", "TOL-1290",
  "ALI-7762", "OVI-3318",
];
const SAMPLE_OWNERS = [
  "Carla Reyes", "Marcus Vidal", "Lía Romero", "Iván Bravo",
  "Nora Castell", "Pau Estévez", "Mireia Soler", "Diego Lago",
  "Aitana Vidal", "Hugo Marín", "Sergi Plana", "Eva Domínguez",
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  ZONES.forEach((zone) => {
    for (let i = 1; i <= SLOTS_PER_ZONE; i++) {
      const id = `${zone}${i.toString().padStart(2, "0")}`;
      // Last 4 of each zone are motorcycles
      const type: VehicleType = i > SLOTS_PER_ZONE - 4 ? "motorcycle" : "car";
      const occupied = Math.random() < 0.62;
      slots.push({
        id,
        label: id,
        zone,
        type,
        vehicle: occupied
          ? {
              plate: rand(SAMPLE_PLATES),
              type,
              owner: rand(SAMPLE_OWNERS),
              enteredAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000),
            }
          : null,
      });
    }
  });
  return slots;
}

function buildMovements(slots: Slot[]): Movement[] {
  const list: Movement[] = [];
  // Active movements from currently occupied slots
  slots.filter((s) => s.vehicle).forEach((s, idx) => {
    list.push({
      id: `M-${1000 + idx}`,
      plate: s.vehicle!.plate,
      type: s.type,
      owner: s.vehicle!.owner,
      slot: s.id,
      checkIn: s.vehicle!.enteredAt,
      checkOut: null,
      amount: 0,
      status: "active",
    });
  });
  // Completed historical
  for (let i = 0; i < 8; i++) {
    const checkIn = new Date(Date.now() - (8 + i) * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + (1 + Math.random() * 4) * 60 * 60 * 1000);
    list.push({
      id: `M-${900 + i}`,
      plate: rand(SAMPLE_PLATES),
      type: Math.random() > 0.7 ? "motorcycle" : "car",
      owner: rand(SAMPLE_OWNERS),
      slot: `${rand(ZONES)}${(1 + Math.floor(Math.random() * 16)).toString().padStart(2, "0")}`,
      checkIn,
      checkOut,
      amount: +(4 + Math.random() * 18).toFixed(2),
      status: "completed",
    });
  }
  return list.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
}

interface ParkingState {
  slots: Slot[];
  movements: Movement[];
  checkIn: (input: { plate: string; type: VehicleType; owner: string; slotId?: string }) => Slot | null;
  checkOut: (slotId: string) => void;
}

const initialSlots = buildSlots();
const initialMovements = buildMovements(initialSlots);

export const useParkingStore = create<ParkingState>((set, get) => ({
  slots: initialSlots,
  movements: initialMovements,
  checkIn: ({ plate, type, owner, slotId }) => {
    const { slots } = get();
    const target =
      (slotId && slots.find((s) => s.id === slotId && !s.vehicle)) ||
      slots.find((s) => s.type === type && !s.vehicle);
    if (!target) return null;
    const vehicle: ParkedVehicle = {
      plate: plate.toUpperCase(),
      type,
      owner,
      enteredAt: new Date(),
    };
    set((state) => ({
      slots: state.slots.map((s) => (s.id === target.id ? { ...s, vehicle } : s)),
      movements: [
        {
          id: `M-${Date.now()}`,
          plate: vehicle.plate,
          type,
          owner,
          slot: target.id,
          checkIn: vehicle.enteredAt,
          checkOut: null,
          amount: 0,
          status: "active",
        },
        ...state.movements,
      ],
    }));
    return { ...target, vehicle };
  },
  checkOut: (slotId) => {
    set((state) => {
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot || !slot.vehicle) return state;
      const minutes = Math.max(1, (Date.now() - slot.vehicle.enteredAt.getTime()) / 60000);
      const amount = +(2 + (minutes / 60) * (slot.type === "car" ? 3.2 : 1.6)).toFixed(2);
      return {
        slots: state.slots.map((s) => (s.id === slotId ? { ...s, vehicle: null } : s)),
        movements: state.movements.map((m) =>
          m.slot === slotId && m.status === "active"
            ? { ...m, status: "completed", checkOut: new Date(), amount }
            : m,
        ),
      };
    });
  },
}));
