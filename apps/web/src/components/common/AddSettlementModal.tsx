import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Settlement } from "@flatflow/core";
import { useSettlements, useMembers, useFlat, useToast } from "../../hooks";
import { settlementFormSchema, type SettlementFormData } from "../../lib/validation";

interface AddSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement?: Settlement | null; // If provided, edit mode
  flatId?: string;
}

export function AddSettlementModal({
  isOpen,
  onClose,
  settlement,
  flatId,
}: AddSettlementModalProps) {
  const { addSettlement, updateSettlement } = useSettlements();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = flatId || getCurrentFlatId();
  const activeMembers = members.filter((m) => m.isActive);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SettlementFormData>({
    resolver: zodResolver(settlementFormSchema),
    defaultValues: {
      fromMemberId: "",
      toMemberId: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const fromMemberId = watch("fromMemberId");

  // Reset form when modal opens/closes or settlement changes
  useEffect(() => {
    if (isOpen) {
      if (settlement) {
        reset({
          fromMemberId: settlement.fromMemberId,
          toMemberId: settlement.toMemberId,
          amount: settlement.amount,
          date: settlement.date.split("T")[0],
          note: settlement.note || "",
        });
      } else {
        reset({
          fromMemberId: activeMembers[0]?.id || "",
          toMemberId: activeMembers[1]?.id || "",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          note: "",
        });
      }
    }
  }, [isOpen, settlement, activeMembers, reset]);

  const onSubmit = (data: SettlementFormData) => {
    if (data.fromMemberId === data.toMemberId) {
      return; // Should be prevented by validation, but just in case
    }

    const dateISO = new Date(data.date).toISOString();
    if (settlement) {
      // Edit mode
      updateSettlement(settlement.id, {
        fromMemberId: data.fromMemberId,
        toMemberId: data.toMemberId,
        amount: data.amount,
        date: dateISO,
        note: data.note || undefined,
      });
      success("Settlement updated successfully");
    } else {
      // Add mode
      addSettlement({
        flatId: currentFlatId,
        fromMemberId: data.fromMemberId,
        toMemberId: data.toMemberId,
        amount: data.amount,
        date: dateISO,
        note: data.note || undefined,
      });
      success("Settlement recorded successfully");
    }
    onClose();
  };

  // Filter out the "from" member from the "to" dropdown
  const availableToMembers = activeMembers.filter(
    (m) => m.id !== fromMemberId
  );

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="add-settlement-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}} // Controlled by parent
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {settlement ? "Edit Settlement" : "Record Settlement"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">From (Who is paying) *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("fromMemberId")}
                >
                  <option value="">Select member</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.emoji} {member.name}
                    </option>
                  ))}
                </select>
                {errors.fromMemberId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.fromMemberId.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">To (Who is receiving) *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("toMemberId")}
                >
                  <option value="">Select member</option>
                  {availableToMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.emoji} {member.name}
                    </option>
                  ))}
                </select>
                {errors.toMemberId && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.toMemberId.message}
                    </span>
                  </label>
                )}
              </div>

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

              <Input
                label="Note (optional)"
                {...register("note")}
                error={errors.note?.message}
                placeholder="e.g., Rent payment for March"
              />
            </div>

            <div className="modal-action">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {settlement ? "Update" : "Record"} Settlement
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

