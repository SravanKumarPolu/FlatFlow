import { useGuestsStore } from "../stores/guestsStore";
import { Guest } from "@flatflow/core";

export function useGuests() {
  const store = useGuestsStore();

  return {
    guests: store.guests,
    addGuest: store.addGuest,
    updateGuest: store.updateGuest,
    deleteGuest: store.deleteGuest,
    getGuest: store.getGuest,
    getGuestsByFlatId: store.getGuestsByFlatId,
    getActiveGuestsByFlatId: store.getActiveGuestsByFlatId,
    getGuestStayDuration: store.getGuestStayDuration,
    checkOutGuest: store.checkOutGuest,
    resetGuests: store.resetGuests,
  };
}

