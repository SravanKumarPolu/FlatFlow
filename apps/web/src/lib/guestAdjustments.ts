import { Guest, Member, Bill } from "@flatflow/core";

export interface GuestAdjustment {
  memberId: string;
  adjustmentAmount: number; // Positive = they pay more, Negative = they pay less
  reason: string;
}

/**
 * Calculate fair adjustments for bills based on guest stays
 * If a member has a guest staying, they should pay a proportional share for rent/utilities
 */
export function calculateGuestAdjustments(
  guests: Guest[],
  members: Member[],
  bills: Bill[],
  flatId: string
): GuestAdjustment[] {
  const adjustments: Map<string, GuestAdjustment> = new Map();
  const activeMembers = members.filter((m) => m.flatId === flatId && m.isActive);
  const memberCount = activeMembers.length;

  if (memberCount === 0) return [];

  // Get active guests (currently staying)
  const activeGuests = guests.filter(
    (g) => g.flatId === flatId && !g.checkOutDate
  );

  // Get bills that should be adjusted (rent, utilities)
  const adjustableBills = bills.filter(
    (b) =>
      b.flatId === flatId &&
      b.isActive &&
      (b.category === "RENT" || b.category === "UTILITY")
  );

  if (activeGuests.length === 0 || adjustableBills.length === 0) {
    return [];
  }

  // Calculate total guest days per host
  const guestDaysPerHost = new Map<string, number>();
  const now = new Date();

  activeGuests.forEach((guest) => {
    const checkIn = new Date(guest.checkInDate);
    const daysStayed = Math.ceil((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const current = guestDaysPerHost.get(guest.hostMemberId) || 0;
    guestDaysPerHost.set(guest.hostMemberId, current + daysStayed);
  });

  // Calculate adjustments for each bill
  adjustableBills.forEach((bill) => {
    const totalGuestDays = Array.from(guestDaysPerHost.values()).reduce(
      (sum, days) => sum + days,
      0
    );

    if (totalGuestDays === 0) return;

    // Calculate per-day cost of the bill (simplified: assume monthly)
    const daysInMonth = 30;
    const dailyCost = bill.amount / daysInMonth;

    // Each guest day adds to the host's share
    guestDaysPerHost.forEach((days, hostMemberId) => {
      // Host pays extra for their guest days
      const extraAmount = (days * dailyCost) / memberCount;

      const existing = adjustments.get(hostMemberId);
      if (existing) {
        existing.adjustmentAmount += extraAmount;
        existing.reason += `, ${bill.name} (${days} guest days)`;
      } else {
        adjustments.set(hostMemberId, {
          memberId: hostMemberId,
          adjustmentAmount: extraAmount,
          reason: `${bill.name} (${days} guest days)`,
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

