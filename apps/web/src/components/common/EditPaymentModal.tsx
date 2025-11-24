import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@flatflow/ui";
import { BillPayment } from "@flatflow/core";
import { useBillPayments, useMembers, useToast } from "../../hooks";

const editPaymentSchema = z.object({
  paidByMemberId: z.string().min(1, "Please select who paid"),
  amount: z
    .number()
    .positive("Amount must be a positive number")
    .min(0.01, "Amount must be at least ₹0.01"),
  paidDate: z.string().min(1, "Date is required"),
  note: z.string().optional().or(z.literal("")),
});

type EditPaymentFormData = z.infer<typeof editPaymentSchema>;

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: BillPayment;
}

export function EditPaymentModal({
  isOpen,
  onClose,
  payment,
}: EditPaymentModalProps) {
  const { updatePayment } = useBillPayments();
  const { members } = useMembers();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditPaymentFormData>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      paidByMemberId: payment.paidByMemberId,
      amount: payment.amount,
      paidDate: payment.paidDate.split("T")[0],
      note: payment.note || "",
    },
  });

  const onSubmit = async (data: EditPaymentFormData) => {
    try {
      updatePayment(payment.id, {
        paidByMemberId: data.paidByMemberId,
        amount: data.amount,
        paidDate: data.paidDate,
        note: data.note || undefined,
      });

      success("Payment updated successfully");
      reset();
      onClose();
    } catch (err) {
      error("Failed to update payment");
      console.error("Update payment error:", err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Get active members for the current flat
  const activeMembers = members.filter((m) => m.isActive);

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="edit-payment-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Payment</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Paid By</span>
                {errors.paidByMemberId && (
                  <span className="label-text-alt text-error">
                    {errors.paidByMemberId.message}
                  </span>
                )}
              </label>
              <select
                className={`select select-bordered w-full ${
                  errors.paidByMemberId ? "select-error" : ""
                }`}
                {...register("paidByMemberId")}
              >
                <option value="">Select member</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.emoji ? `${member.emoji} ` : ""}
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Amount Paid</span>
                {errors.amount && (
                  <span className="label-text-alt text-error">{errors.amount.message}</span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={`input input-bordered w-full ${errors.amount ? "input-error" : ""}`}
                {...register("amount", { valueAsNumber: true })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Payment Date</span>
                {errors.paidDate && (
                  <span className="label-text-alt text-error">{errors.paidDate.message}</span>
                )}
              </label>
              <input
                type="date"
                className={`input input-bordered w-full ${
                  errors.paidDate ? "input-error" : ""
                }`}
                {...register("paidDate")}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Note (Optional)</span>
                {errors.note && (
                  <span className="label-text-alt text-error">{errors.note.message}</span>
                )}
              </label>
              <textarea
                className={`textarea textarea-bordered ${errors.note ? "textarea-error" : ""}`}
                rows={3}
                placeholder="Add a note about this payment..."
                {...register("note")}
              />
            </div>

            <div className="modal-action">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update Payment"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

