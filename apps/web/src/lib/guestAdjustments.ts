import { Guest, Member, Bill } from "@flatflow/core";

export interface GuestAdjustment {
  memberId: string;
  adjustmentAmount: number; // Positive = they pay more, Negative = they pay less
  reason: string;
}

/**
 * Calculate fair adjustments for bills based on guest stays
 * Supports pro-rated rent/utilities for mid-month move-in/out
 * If a member has a guest staying, they should pay a proportional share for rent/utilities
 */
export function calculateGuestAdjustments(
  guests: Guest[],
  members: Member[],
  bills: Bill[],
  flatId: string,
  referenceDate?: Date // Optional: calculate for a specific date (defaults to today)
): GuestAdjustment[] {
  const adjustments: Map<string, GuestAdjustment> = new Map();
  const activeMembers = members.filter((m) => m.flatId === flatId && m.isActive);
  const memberCount = activeMembers.length;

  if (memberCount === 0) return [];

  const now = referenceDate || new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get first and last day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  const daysInMonth = lastDayOfMonth.getDate();

  // Get guests that were active during the current month
  const relevantGuests = guests.filter((g) => {
    if (g.flatId !== flatId) return false;
    
    const checkIn = new Date(g.checkInDate);
    const checkOut = g.checkOutDate ? new Date(g.checkOutDate) : now;
    
    // Guest was active if they checked in before or during the month
    // and checked out after or during the month
    return checkIn <= lastDayOfMonth && checkOut >= firstDayOfMonth;
  });

  // Get bills that should be adjusted (rent, utilities)
  const adjustableBills = bills.filter(
    (b) =>
      b.flatId === flatId &&
      b.isActive &&
      (b.category === "RENT" || b.category === "UTILITY")
  );

  if (relevantGuests.length === 0 || adjustableBills.length === 0) {
    return [];
  }

  // Calculate guest days per host within the current month
  const guestDaysPerHost = new Map<string, number>();

  relevantGuests.forEach((guest) => {
    const checkIn = new Date(guest.checkInDate);
    const checkOut = guest.checkOutDate ? new Date(guest.checkOutDate) : now;
    
    // Calculate actual days stayed within the current month
    const monthStart = checkIn < firstDayOfMonth ? firstDayOfMonth : checkIn;
    const monthEnd = checkOut > lastDayOfMonth ? lastDayOfMonth : checkOut;
    
    const daysStayed = Math.ceil(
      (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1; // +1 to include both start and end days
    
    if (daysStayed > 0) {
      const current = guestDaysPerHost.get(guest.hostMemberId) || 0;
      guestDaysPerHost.set(guest.hostMemberId, current + daysStayed);
    }
  });

  // Calculate adjustments for each bill
  adjustableBills.forEach((bill) => {
    const totalGuestDays = Array.from(guestDaysPerHost.values()).reduce(
      (sum, days) => sum + days,
      0
    );

    if (totalGuestDays === 0) return;

    // Calculate per-day cost of the bill (pro-rated for the month)
    // const dailyCost = bill.amount / daysInMonth; // Not used, kept for reference

    // Each guest day adds to the host's share
    // The adjustment is: (guest days / total days in month) * (bill amount / member count)
    guestDaysPerHost.forEach((days, hostMemberId) => {
      // Host pays extra for their guest days
      // Formula: (guest days / days in month) * (bill amount / member count)
      const extraAmount = (days / daysInMonth) * (bill.amount / memberCount);

      const existing = adjustments.get(hostMemberId);
      if (existing) {
        existing.adjustmentAmount += extraAmount;
        existing.reason += `, ${bill.name} (${days} days in month)`;
      } else {
        adjustments.set(hostMemberId, {
          memberId: hostMemberId,
          adjustmentAmount: extraAmount,
          reason: `${bill.name} (${days} days in month)`,
        });
      }
    });
  });

  return Array.from(adjustments.values());
}

/**
 * Get total adjustment amount for a member
 */
export function getMemberGuestAdjustment(
  adjustments: GuestAdjustment[],
  memberId: string
): number {
  const adjustment = adjustments.find((a) => a.memberId === memberId);
  return adjustment?.adjustmentAmount || 0;
}

