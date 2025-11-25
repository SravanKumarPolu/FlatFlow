import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { useEmergencyFund, useMembers, useFlat, useToast } from "../../hooks";
import {
  emergencyFundTransactionSchema,
  type EmergencyFundTransactionFormData,
} from "../../lib/validation";

interface EmergencyFundTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "CONTRIBUTION" | "WITHDRAWAL";
}

export function EmergencyFundTransactionModal({
  isOpen,
  onClose,
  type,
}: EmergencyFundTransactionModalProps) {
  const { addContribution, addWithdrawal, getFundByFlatId } = useEmergencyFund();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success, error } = useToast();
  const currentFlatId = getCurrentFlatId();

  const flatMembers = members.filter((m) => m.flatId === currentFlatId && m.isActive);
  const fund = currentFlatId ? getFundByFlatId(currentFlatId) : undefined;
  
  // Calculate current balance from transactions (derived)
  const currentBalance = useMemo(() => {
    if (!fund) return 0;
    return fund.transactions.reduce((sum, t) => {
      return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [fund]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmergencyFundTransactionFormData>({
    resolver: zodResolver(emergencyFundTransactionSchema),
    defaultValues: {
      memberId: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        memberId: flatMembers.length > 0 ? flatMembers[0].id : "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [isOpen, flatMembers, reset]);

  const onSubmit = (data: EmergencyFundTransactionFormData) => {
    if (!currentFlatId) {
      return;
    }

    try {
      const transactionDate = data.date
        ? new Date(data.date).toISOString()
        : undefined;

      if (type === "CONTRIBUTION") {
        addContribution(
          currentFlatId,
          data.memberId,
          data.amount,
          data.description || undefined,
          transactionDate
        );
        success(`Contribution of ₹${data.amount} added successfully`);
      } else {
        if (currentBalance < data.amount) {
          error("Insufficient funds in emergency fund");
          return;
        }
        addWithdrawal(
          currentFlatId,
          data.memberId,
          data.amount,
          data.description || undefined,
          transactionDate
        );
        success(`Withdrawal of ₹${data.amount} recorded successfully`);
      }
      reset();
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="emergency-fund-transaction-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {type === "CONTRIBUTION" ? "Add Contribution" : "Record Withdrawal"}
          </h3>

          {type === "WITHDRAWAL" && (
            <div className="alert alert-info mb-4">
              <div>
                <div className="font-bold">Available Balance</div>
                <div className="text-lg">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(currentBalance)}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Member</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("memberId")}
              >
                <option value="">Select member</option>
                {flatMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.emoji} {member.name}
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.memberId.message}
                  </span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register("amount", { valueAsNumber: true })}
                error={errors.amount?.message}
                placeholder="0.00"
              />

              <Input
                label="Date"
                type="date"
                {...register("date")}
                error={errors.date?.message}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                {...register("description")}
                placeholder={
                  type === "CONTRIBUTION"
                    ? "e.g., Monthly contribution"
                    : "e.g., Repair for broken appliance"
                }
                rows={3}
              />
            </div>

            <div className="modal-action">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "Processing..."
                  : type === "CONTRIBUTION"
                    ? "Add Contribution"
                    : "Record Withdrawal"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

