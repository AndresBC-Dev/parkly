import { create } from "zustand";
import api from "./api";
import { Currency, Customer, Movement, Rate, Slot, VehicleType, CustomerInput } from "./parking-types";
import { convertCurrency } from "./currency-utils";

const ZONES = ["A", "B", "C"] as const;
const SLOTS_PER_ZONE = 16;

// Mock data generation removed as it now comes from the backend

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
  rates: Rate[];
  currency: Currency;
  language: Language;

  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  migrateRates: (to: Currency) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchSlots: () => Promise<void>;
  fetchMovements: () => Promise<void>;
  fetchRates: () => Promise<void>;

  addCustomer: (input: CustomerInput) => Promise<Customer>;
  updateCustomer: (id: string, patch: Partial<CustomerInput>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addSlot: (slot: Omit<Slot, "id" | "vehicle">) => Promise<void>;
  updateSlot: (id: string, slot: Partial<Slot>) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;

  addRate: (rate: Omit<Rate, "id">) => Promise<void>;
  updateRate: (id: string, rate: Partial<Rate>) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;

  checkIn: (input: CheckInInput) => Promise<Slot | null>;
  checkOut: (slotId: string) => Promise<void>;

  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const initialCustomers: Customer[] = [];
const initialSlots: Slot[] = [];
const initialMovements: Movement[] = [];
const initialRates: Rate[] = [];

export const useParkingStore = create<ParkingState>((set, get) => ({
  customers: initialCustomers,
  slots: initialSlots,
  movements: initialMovements,
  rates: initialRates,
  currency: (localStorage.getItem("parkly_currency") as Currency) || "EUR",
  language: (localStorage.getItem("parkly_language") as Language) || "es",

  setCurrency: (c: Currency) => {
    localStorage.setItem("parkly_currency", c);
    set({ currency: c });
  },

  setLanguage: (l: Language) => {
    localStorage.setItem("parkly_language", l);
    set({ language: l });
  },

  migrateRates: async (to) => {
    const from = get().currency;
    const currentRates = get().rates;
    
    for (const r of currentRates) {
      const newValue = convertCurrency(r.value, from, to);
      await get().updateRate(r.id, { ...r, value: newValue, currency: to });
    }
    get().setCurrency(to);
  },

  fetchCustomers: async () => {
    try {
      const res = await api.get<Customer[]>("/customers");
      // Map strings to Dates
      const customers = res.data.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
      set({ customers });
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  },

  addCustomer: async (input) => {
    const res = await api.post<Customer>("/customers", input);
    const customer = { ...res.data, createdAt: new Date(res.data.createdAt) };
    set((s) => ({ customers: [customer, ...s.customers] }));
    return customer;
  },

  updateCustomer: async (id, patch) => {
    const res = await api.put<Customer>(`/customers/${id}`, patch);
    const updated = { ...res.data, createdAt: new Date(res.data.createdAt) };
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}`);
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
  },

  fetchSlots: async () => {
    try {
      const res = await api.get<Slot[]>("/slots");
      const slots = res.data.map(s => ({
        ...s,
        vehicle: s.vehicle ? { ...s.vehicle, enteredAt: new Date(s.vehicle.enteredAt) } : null
      }));
      set({ slots });
    } catch (error) {
      console.error("Failed to fetch slots", error);
    }
  },

  addSlot: async (slotInput) => {
    try {
      const id = `${slotInput.zone}-${Math.floor(Math.random() * 1000)}`;
      const res = await api.post<Slot>("/slots", { ...slotInput, id, vehicle: null });
      set((s) => ({ slots: [...s.slots, res.data] }));
    } catch (error) {
      console.error("Failed to add slot", error);
    }
  },

  updateSlot: async (id, patch) => {
    try {
      const current = get().slots.find(s => s.id === id);
      if (!current) return;
      const res = await api.put<Slot>(`/slots/${id}`, { ...current, ...patch });
      set((s) => ({ slots: s.slots.map((sl) => (sl.id === id ? res.data : sl)) }));
    } catch (error) {
      console.error("Failed to update slot", error);
    }
  },

  deleteSlot: async (id) => {
    try {
      await api.delete(`/slots/${id}`);
      set((s) => ({ slots: s.slots.filter((sl) => sl.id !== id) }));
    } catch (error) {
      console.error("Failed to delete slot", error);
    }
  },

  fetchMovements: async () => {
    try {
      const res = await api.get<Movement[]>("/movements");
      const movements = res.data.map(m => ({
        ...m,
        checkIn: new Date(m.checkIn),
        checkOut: m.checkOut ? new Date(m.checkOut) : null
      }));
      set({ movements });
    } catch (error) {
      console.error("Failed to fetch movements", error);
    }
  },

  fetchRates: async () => {
    try {
      const res = await api.get<Rate[]>("/rates");
      set({ rates: res.data });
    } catch (error) {
      console.error("Failed to fetch rates", error);
    }
  },

  addRate: async (rate) => {
    try {
      const res = await api.post<Rate>("/rates", rate);
      set((s) => ({ rates: [...s.rates, res.data] }));
    } catch (error) {
      console.error("Failed to add rate", error);
    }
  },

  updateRate: async (id, patch) => {
    try {
      const res = await api.put<Rate>(`/rates/${id}`, patch);
      set((s) => ({ rates: s.rates.map((r) => (r.id === id ? res.data : r)) }));
    } catch (error) {
      console.error("Failed to update rate", error);
    }
  },

  deleteRate: async (id) => {
    try {
      await api.delete(`/rates/${id}`);
      set((s) => ({ rates: s.rates.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error("Failed to delete rate", error);
    }
  },

  checkIn: async (input) => {
    try {
      const res = await api.post<Slot>("/operations/check-in", input);
      const updatedSlot = {
        ...res.data,
        vehicle: res.data.vehicle ? { ...res.data.vehicle, enteredAt: new Date(res.data.vehicle.enteredAt) } : null
      };
      
      set((state) => ({
        slots: state.slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)),
      }));
      
      // Refresh movements and customers too to be safe
      get().fetchMovements();
      get().fetchCustomers();
      
      return updatedSlot;
    } catch (error) {
      console.error("Check-in failed", error);
      return null;
    }
  },

  checkOut: async (slotId) => {
    try {
      await api.post(`/operations/check-out?slotId=${slotId}`);
      
      set((state) => ({
        slots: state.slots.map((s) => (s.id === slotId ? { ...s, vehicle: null } : s)),
      }));
      
      // Refresh movements to get the completed one
      get().fetchMovements();
    } catch (error) {
      console.error("Check-out failed", error);
    }
  },

  user: null,
  login: (token, user) => {
    localStorage.setItem("parkly_token", token);
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("parkly_token");
    set({ user: null });
  },
}));
