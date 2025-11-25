import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Guest } from "@flatflow/core";

interface GuestsState {
  guests: Guest[];
  addGuest: (guest: Omit<Guest, "id" | "createdAt" | "updatedAt">) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  getGuest: (id: string) => Guest | undefined;
  getGuestsByFlatId: (flatId: string) => Guest[];
  getActiveGuestsByFlatId: (flatId: string) => Guest[]; // Guests currently staying
  getGuestStayDuration: (guestId: string) => number; // Returns days
  checkOutGuest: (guestId: string, checkOutDate?: string, notes?: string) => void;
  resetGuests: () => void;
}

const generateId = () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useGuestsStore = create<GuestsState>()(
  persist(
    (set, get) => ({
      guests: [],

      addGuest: (guestData) => {
        const now = new Date().toISOString();
        const newGuest: Guest = {
          ...guestData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          guests: [...state.guests, newGuest],
        }));
      },

      updateGuest: (id, updates) => {
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id
              ? { ...guest, ...updates, updatedAt: new Date().toISOString() }
              : guest
          ),
        }));
      },

      deleteGuest: (id) => {
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        }));
      },

      getGuest: (id) => {
        return get().guests.find((guest) => guest.id === id);
      },

      getGuestsByFlatId: (flatId) => {
        return get()
          .guests.filter((guest) => guest.flatId === flatId)
          .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
      },

      getActiveGuestsByFlatId: (flatId) => {
        return get()
          .guests.filter(
            (guest) => guest.flatId === flatId && !guest.checkOutDate
          )
          .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
      },

      getGuestStayDuration: (guestId) => {
        const guest = get().getGuest(guestId);
        if (!guest) return 0;

        const checkIn = new Date(guest.checkInDate);
        const checkOut = guest.checkOutDate
          ? new Date(guest.checkOutDate)
          : new Date();
        const diffTime = checkOut.getTime() - checkIn.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },

      checkOutGuest: (guestId, checkOutDate, notes?) => {
        const checkout = checkOutDate || new Date().toISOString();
        const guest = get().getGuest(guestId);
        const updates: Partial<Guest> = { checkOutDate: checkout };
        if (notes) {
          // Append checkout notes to existing notes if any
          const existingNotes = guest?.notes || "";
          updates.notes = existingNotes
            ? `${existingNotes}\n[Check-out: ${new Date(checkout).toLocaleDateString("en-IN")}] ${notes}`
            : `[Check-out: ${new Date(checkout).toLocaleDateString("en-IN")}] ${notes}`;
        }
        get().updateGuest(guestId, updates);
      },

      resetGuests: () => {
        set({ guests: [] });
      },
    }),
    {
      name: "flatflow-guests-storage",
    }
  )
);

