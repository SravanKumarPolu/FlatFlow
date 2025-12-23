import { z } from "zod";
import { BillCategory, ExpenseCategory } from "@flatflow/core";

// Member form schema
export const memberFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  emoji: z
    .string()
    .max(2, "Emoji must be 1-2 characters")
    .optional()
    .or(z.literal("")),
  weight: z
    .number()
    .positive("Weight must be a positive number")
    .min(0.1, "Weight must be at least 0.1"),
  isActive: z.boolean(),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;

// Bill form schema
export const billFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .min(0.01, "Amount must be at least ₹0.01"),
  dueDay: z
    .number()
    .int("Due day must be a whole number")
    .min(1, "Due day must be between 1 and 31")
    .max(31, "Due day must be between 1 and 31"),
  category: z.enum(["RENT", "UTILITY", "MAID", "FOOD", "OTHER"]),
  splitType: z.enum(["EQUAL", "WEIGHTED"]),
  isActive: z.boolean(),
});

export type BillFormData = z.infer<typeof billFormSchema>;

// Expense form schema
export const expenseFormSchema = z.object({
  description: z.string().min(1, "Description is required").trim(),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .min(0.01, "Amount must be at least ₹0.01"),
  date: z.string().min(1, "Date is required"),
  category: z.enum([
    "RENT",
    "UTILITY",
    "FOOD",
    "TRAVEL",
    "GROCERY",
    "SWIGGY",
    "OLA_UBER",
    "OTHER",
  ]),
  paidByMemberId: z.string().min(1, "Please select who paid"),
  participantMemberIds: z
    .array(z.string())
    .min(1, "At least one participant is required"),
  comments: z.string().optional().or(z.literal("")),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// Flat form schema
export const flatFormSchema = z.object({
  name: z.string().min(1, "Flat name is required").trim(),
  city: z.string().optional().or(z.literal("")),
  billingCycleStartDay: z
    .number()
    .int("Billing cycle day must be a whole number")
    .min(1, "Billing cycle day must be between 1 and 28")
    .max(28, "Billing cycle day must be between 1 and 28"),
  currency: z.literal("INR"),
});

export type FlatFormData = z.infer<typeof flatFormSchema>;

// Settlement form schema
export const settlementFormSchema = z
  .object({
    fromMemberId: z.string().min(1, "Please select who is paying"),
    toMemberId: z.string().min(1, "Please select who is receiving"),
    amount: z
      .number()
      .positive("Amount must be a positive number")
      .min(0.01, "Amount must be at least ₹0.01"),
    date: z.string().min(1, "Date is required"),
    note: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.fromMemberId !== data.toMemberId, {
    message: "From and To members must be different",
    path: ["toMemberId"],
  });

export type SettlementFormData = z.infer<typeof settlementFormSchema>;

// Chore form schema
export const choreFormSchema = z.object({
  name: z.string().min(1, "Chore name is required").trim(),
  category: z.enum([
    "CLEANING",
    "KITCHEN",
    "BATHROOM",
    "TRASH",
    "UTILITIES",
    "OTHER",
  ]),
  description: z.string().optional().or(z.literal("")),
  rotationOrder: z
    .array(z.string())
    .min(1, "At least one member must be in rotation"),
  currentAssigneeId: z.string().min(1, "Please select current assignee"),
  frequency: z.enum(["DAILY", "WEEKLY", "BI_WEEKLY", "MONTHLY"]),
  rotationEnabled: z.boolean(),
  nextDueDate: z.string().min(1, "Next due date is required"),
  isActive: z.boolean(),
});

export type ChoreFormData = z.infer<typeof choreFormSchema>;

// Guest form schema
export const guestFormSchema = z
  .object({
    name: z.string().min(1, "Guest name is required").trim(),
    phone: z.string().optional().or(z.literal("")),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    idProofType: z
      .enum(["AADHAAR", "PAN", "DRIVING_LICENSE", "PASSPORT", "OTHER"])
      .optional(),
    idProofNumber: z.string().optional().or(z.literal("")),
    guestType: z.enum(["SHARING", "SINGLE", "SHORT_STAY", "STAFF", "OTHER"]),
    hostMemberId: z.string().min(1, "Please select host member"),
    roomBed: z.string().optional().or(z.literal("")),
    checkInDate: z.string().min(1, "Check-in date is required"),
    expectedCheckOutDate: z.string().optional().or(z.literal("")),
    checkOutDate: z.string().optional().or(z.literal("")),
    paymentStatus: z.enum(["PENDING", "PAID", "PARTIAL", "WAIVED"]).optional(),
    notes: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.expectedCheckOutDate && data.checkInDate) {
        return (
          new Date(data.expectedCheckOutDate) >= new Date(data.checkInDate)
        );
      }
      return true;
    },
    {
      message: "Expected check-out date must be after check-in date",
      path: ["expectedCheckOutDate"],
    }
  )
  .refine(
    (data) => {
      if (data.checkOutDate && data.checkInDate) {
        return new Date(data.checkOutDate) >= new Date(data.checkInDate);
      }
      return true;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOutDate"],
    }
  );

export type GuestFormData = z.infer<typeof guestFormSchema>;

// Emergency Fund transaction schema
export const emergencyFundTransactionSchema = z.object({
  memberId: z.string().min(1, "Please select member"),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .min(0.01, "Amount must be at least ₹0.01"),
  date: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type EmergencyFundTransactionFormData = z.infer<
  typeof emergencyFundTransactionSchema
>;
