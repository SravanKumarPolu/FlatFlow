// Shared types and models for FlatFlow
// Core domain entities for flat-sharing expense management

export interface Flat {
  id: string;
  name: string;
  city?: string;
  billingCycleStartDay: number; // 1-28
  currency: "INR";
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  flatId: string;
  name: string;
  emoji?: string;
  weight: number; // 1 = normal, 0.5, 1.5 etc (future)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BillCategory = "RENT" | "UTILITY" | "MAID" | "FOOD" | "OTHER";

export interface Bill {
  id: string;
  flatId: string;
  name: string; // "Rent", "WiFi", "Maid"
  amount: number;
  dueDay: number; // 1-31
  category: BillCategory;
  splitType: "EQUAL" | "WEIGHTED"; // MVP: use 'EQUAL'
  payerMemberId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | "RENT"
  | "UTILITY"
  | "FOOD"
  | "TRAVEL"
  | "GROCERY"
  | "SWIGGY"
  | "OLA_UBER"
  | "OTHER";

export interface Expense {
  id: string;
  flatId: string;
  billId?: string; // link to a Bill if applicable
  description: string;
  amount: number;
  date: string; // ISO date
  category: ExpenseCategory;
  paidByMemberId: string;
  splitType: "EQUAL"; // MVP
  participantMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  flatId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface BillPayment {
  id: string;
  billId: string;
  flatId: string;
  paidByMemberId: string;
  amount: number;
  paidDate: string; // ISO date
  note?: string;
  createdAt: string;
}

export type ChoreCategory = "CLEANING" | "KITCHEN" | "BATHROOM" | "TRASH" | "UTILITIES" | "OTHER";

export interface Chore {
  id: string;
  flatId: string;
  name: string;
  category: ChoreCategory;
  description?: string;
  rotationOrder: string[]; // Array of member IDs in rotation order
  currentAssigneeId: string; // Current member assigned
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  isActive: boolean;
  lastCompletedAt?: string; // ISO date
  lastCompletedBy?: string; // Member ID
  createdAt: string;
  updatedAt: string;
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  flatId: string;
  completedByMemberId: string;
  completedAt: string; // ISO date
  note?: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  flatId: string;
  name: string;
  hostMemberId: string; // Member who is hosting the guest
  checkInDate: string; // ISO date
  checkOutDate?: string; // ISO date (null if still staying)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyFundTransaction {
  id: string;
  flatId: string;
  type: "CONTRIBUTION" | "WITHDRAWAL";
  memberId: string; // Who contributed or withdrew
  amount: number;
  date: string; // ISO date
  description?: string;
  createdAt: string;
}

export interface EmergencyFund {
  id: string;
  flatId: string;
  balance: number; // Current balance
  transactions: EmergencyFundTransaction[];
  createdAt: string;
  updatedAt: string;
}

