import { create } from "zustand";
import type {
  Slot,
  Movement,
  VehicleType,
  ParkedVehicle,
  Customer,
} from "./parking-types";

const ZONES = ["A", "B", "C"] as const;
const SLOTS_PER_ZONE = 16;

const SEED_CUSTOMERS: Omit<Customer, "id" | "createdAt">[] = [
  { name: "Carla Reyes", email: "carla.reyes@parkly.io", phone: "+34 612 884 102", plates: ["MAD-2841"], plan: "monthly" },
  { name: "Marcus Vidal", email: "m.vidal@nube.es", phone: "+34 655 901 230", plates: ["BCN-9027", "BCN-1133"], plan: "vip" },
  { name: "Lía Romero", email: "lia@romero.co", phone: "+34 600 553 117", plates: ["VAL-1156"], plan: "casual" },
  { name: "Iván Bravo", email: "ivan.bravo@correo.es", phone: "+34 678 220 884", plates: ["SEV-7710"], plan: "monthly" },
  { name: "Nora Castell", email: "nora@castell.dev", phone: "+34 644 110 902", plates: ["BIL-3392"], plan: "casual" },
  { name: "Pau Estévez", email: "pau.estevez@correo.com", phone: "+34 699 400 110", plates: ["MUR-0048"], plan: "monthly" },
  { name: "Mireia Soler", email: "mireia@soler.cat", phone: "+34 633 220 558", plates: ["MAL-6621"], plan: "vip" },
  { name: "Diego Lago", email: "diego.lago@parkly.io", phone: "+34 611 770 333", plates: ["ZAR-4407"], plan: "casual" },
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCustomers(): Customer[] {
  return SEED_CUSTOMERS.map((c, i) => ({
    ...c,
    id: `C-${1000 + i}`,
    createdAt: new Date(Date.now() - (i + 1) * 86_400_000 * 11),
  }));
}

function buildSlots(customers: Customer[]): Slot[] {
  const slots: Slot[] = [];
  ZONES.forEach((zone) => {
    for (let i = 1; i <= SLOTS_PER_ZONE; i++) {
      const id = `${zone}${i.toString().padStart(2, "0")}`;
      const type: VehicleType = i > SLOTS_PER_ZONE - 4 ? "motorcycle" : "car";
      const occupied = Math.random() < 0.62;
      let vehicle: ParkedVehicle | null = null;
      if (occupied) {
        const c = rand(customers);
        const plate = c.plates[0];
        vehicle = {
          plate,
          type,
          owner: c.name,
          customerId: c.id,
          enteredAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000),
        };
      }
      slots.push({ id, label: id, zone, type, vehicle });
    }
  });
  return slots;
}

function buildMovements(slots: Slot[], customers: Customer[]): Movement[] {
  const list: Movement[] = [];
  slots.filter((s) => s.vehicle).forEach((s, idx) => {
    list.push({
      id: `M-${1000 + idx}`,
      plate: s.vehicle!.plate,
      type: s.type,
      owner: s.vehicle!.owner,
      customerId: s.vehicle!.customerId,
      slot: s.id,
      checkIn: s.vehicle!.enteredAt,
      checkOut: null,
      amount: 0,
      status: "active",
    });
  });
  for (let i = 0; i < 8; i++) {
    const c = rand(customers);
    const checkIn = new Date(Date.now() - (8 + i) * 60 * 60 * 1000);
    const checkOut = new Date(checkIn.getTime() + (1 + Math.random() * 4) * 60 * 60 * 1000);
    list.push({
      id: `M-${900 + i}`,
      plate: c.plates[0],
      type: Math.random() > 0.7 ? "motorcycle" : "car",
      owner: c.name,
      customerId: c.id,
      slot: `${rand(ZONES)}${(1 + Math.floor(Math.random() * 16)).toString().padStart(2, "0")}`,
      checkIn,
      checkOut,
      amount: +(4 + Math.random() * 18).toFixed(2),
      status: "completed",
    });
  }
  return list.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
}

interface CheckInInput {
  plate: string;
  type: VehicleType;
  owner: string;
  customerId?: string;
  slotId?: string;
}

interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  plates: string[];
  plan: Customer["plan"];
  notes?: string;
}

interface ParkingState {
  customers: Customer[];
  slots: Slot[];
  movements: Movement[];

  addCustomer: (input: CustomerInput) => Customer;
  updateCustomer: (id: string, patch: Partial<CustomerInput>) => void;
  deleteCustomer: (id: string) => void;

  checkIn: (input: CheckInInput) => Slot | null;
  checkOut: (slotId: string) => void;
}

const initialCustomers = buildCustomers();
const initialSlots = buildSlots(initialCustomers);
const initialMovements = buildMovements(initialSlots, initialCustomers);

export const useParkingStore = create<ParkingState>((set, get) => ({
  customers: initialCustomers,
  slots: initialSlots,
  movements: initialMovements,

  addCustomer: (input) => {
    const customer: Customer = {
      ...input,
      plates: input.plates.map((p) => p.toUpperCase()),
      id: `C-${Date.now()}`,
      createdAt: new Date(),
    };
    set((s) => ({ customers: [customer, ...s.customers] }));
    return customer;
  },

  updateCustomer: (id, patch) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              ...patch,
              plates: patch.plates ? patch.plates.map((p) => p.toUpperCase()) : c.plates,
            }
          : c,
      ),
    }));
  },

  deleteCustomer: (id) => {
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
  },

  checkIn: ({ plate, type, owner, customerId, slotId }) => {
    const { slots, customers } = get();
    const target =
      (slotId && slots.find((s) => s.id === slotId && !s.vehicle)) ||
      slots.find((s) => s.type === type && !s.vehicle);
    if (!target) return null;
    const upperPlate = plate.toUpperCase();

    // Auto-link by plate if no explicit customer
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const match = customers.find((c) => c.plates.includes(upperPlate));
      if (match) resolvedCustomerId = match.id;
    }

    const vehicle: ParkedVehicle = {
      plate: upperPlate,
      type,
      owner,
      customerId: resolvedCustomerId,
      enteredAt: new Date(),
    };

    set((state) => ({
      slots: state.slots.map((s) => (s.id === target.id ? { ...s, vehicle } : s)),
      // Add plate to customer if missing
      customers: resolvedCustomerId
        ? state.customers.map((c) =>
            c.id === resolvedCustomerId && !c.plates.includes(upperPlate)
              ? { ...c, plates: [...c.plates, upperPlate] }
              : c,
          )
        : state.customers,
      movements: [
        {
          id: `M-${Date.now()}`,
          plate: vehicle.plate,
          type,
          owner,
          customerId: resolvedCustomerId,
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
