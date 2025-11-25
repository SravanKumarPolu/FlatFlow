import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Expense, ExpenseCategory } from "@flatflow/core";
import { useExpenses, useMembers, useFlat, useToast, useImpulseControl } from "../../hooks";
import { expenseFormSchema, type ExpenseFormData } from "../../lib/validation";
import { shouldNudge } from "../../lib/impulseControl";
import { useState } from "react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null; // If provided, edit mode
  flatId?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "RENT",
  "UTILITY",
  "FOOD",
  "TRAVEL",
  "GROCERY",
  "SWIGGY",
  "OLA_UBER",
  "OTHER",
];

export function AddExpenseModal({
  isOpen,
  onClose,
  expense,
  flatId,
}: AddExpenseModalProps) {
  const { addExpense, updateExpense, expenses } = useExpenses();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const { limits, globalEnabled } = useImpulseControl();
  const currentFlatId = flatId || getCurrentFlatId();
  const activeMembers = members.filter((m) => m.isActive);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "GROCERY",
      paidByMemberId: "",
      participantMemberIds: [],
    },
  });

  const participantMemberIds = watch("participantMemberIds");

  // Reset form when modal opens/closes or expense changes
  useEffect(() => {
    if (isOpen) {
      if (expense) {
        reset({
          description: expense.description,
          amount: expense.amount,
          date: expense.date.split("T")[0],
          category: expense.category,
          paidByMemberId: expense.paidByMemberId,
          participantMemberIds: expense.participantMemberIds,
        });
      } else {
        const defaultParticipants = activeMembers.map((m) => m.id);
        reset({
          description: "",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          category: "GROCERY",
          paidByMemberId: activeMembers[0]?.id || "",
          participantMemberIds: defaultParticipants,
        });
      }
    }
  }, [isOpen, expense, activeMembers, reset]);

  const onSubmit = (data: ExpenseFormData) => {
    // Check for impulse control nudge (only for new expenses)
    if (!expense) {
      const flatExpenses = expenses.filter((e) => e.flatId === currentFlatId);
      const nudge = shouldNudge(data.category, data.amount, flatExpenses, limits, globalEnabled);
      if (nudge.shouldNudge && !showNudge) {
        setNudgeMessage(nudge.message);
        setShowNudge(true);
        return;
      }
    }

    const dateISO = new Date(data.date).toISOString();
    if (expense) {
      // Edit mode
      updateExpense(expense.id, {
        description: data.description,
        amount: data.amount,
        date: dateISO,
        category: data.category,
        paidByMemberId: data.paidByMemberId,
        participantMemberIds: data.participantMemberIds,
      });
      success(`Expense "${data.description}" updated successfully`);
    } else {
      // Add mode
      addExpense({
        flatId: currentFlatId!,
        description: data.description,
        amount: data.amount,
        date: dateISO,
        category: data.category,
        paidByMemberId: data.paidByMemberId,
        splitType: "EQUAL",
        participantMemberIds: data.participantMemberIds,
      });
      success(`Expense "${data.description}" added successfully`);
    }
    reset();
    setShowNudge(false);
    setNudgeMessage("");
    onClose();
  };

  const handleConfirmNudge = () => {
    setShowNudge(false);
    // Re-submit the form
    handleSubmit(onSubmit)();
  };

  const toggleParticipant = (memberId: string) => {
    const current = participantMemberIds || [];
    if (current.includes(memberId)) {
      setValue(
        "participantMemberIds",
        current.filter((id) => id !== memberId),
        { shouldValidate: true }
      );
    } else {
      setValue("participantMemberIds", [...current, memberId], {
        shouldValidate: true,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="add-expense-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}} // Controlled by parent
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">
            {expense ? "Edit Expense" : "Add Expense"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Description *"
                {...register("description")}
                error={errors.description?.message}
                placeholder="e.g., Grocery shopping at Big Bazaar"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount (₹) *"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("amount", { valueAsNumber: true })}
                  error={errors.amount?.message}
                  placeholder="0.00"
                />

                <Input
                  label="Date *"
                  type="date"
                  {...register("date")}
                  error={errors.date?.message}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("category")}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.category.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Paid By *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("paidByMemberId")}
                >
                  <option value="">Select member</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.emoji} {member.name}
                    </option>
                  ))}
                </select>
                {errors.paidByMemberId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.paidByMemberId.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Participants *</span>
                </label>
                <div className="space-y-2">
                  {activeMembers.map((member) => (
                    <label
                      key={member.id}
                      className="label cursor-pointer justify-start gap-4"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={participantMemberIds?.includes(member.id) || false}
                        onChange={() => toggleParticipant(member.id)}
                      />
                      <span className="label-text">
                        {member.emoji} {member.name}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.participantMemberIds && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.participantMemberIds.message}
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="modal-action">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {expense ? "Update" : "Add"} Expense
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>

      {/* Nudge Confirmation Modal */}
      {showNudge && (
        <>
          <input
            type="checkbox"
            id="nudge-modal"
            className="modal-toggle"
            checked={showNudge}
            onChange={() => {}}
          />
          <div className="modal" role="dialog">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">⚠️ Spending Limit Warning</h3>
              <p className="whitespace-pre-line mb-4">{nudgeMessage}</p>
              <div className="modal-action">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNudge(false);
                    setNudgeMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmNudge}>
                  Yes, Add Anyway
                </Button>
              </div>
            </div>
            <label className="modal-backdrop" onClick={() => setShowNudge(false)}></label>
          </div>
        </>
      )}
    </>
  );
}
