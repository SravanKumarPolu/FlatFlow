import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Bill, BillCategory } from "@flatflow/core";
import { useBills, useFlat, useToast } from "../../hooks";
import { billFormSchema, type BillFormData } from "../../lib/validation";

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill?: Bill | null; // If provided, edit mode
  flatId?: string;
}

const BILL_CATEGORIES: BillCategory[] = ["RENT", "UTILITY", "MAID", "FOOD", "OTHER"];

export function AddBillModal({
  isOpen,
  onClose,
  bill,
  flatId,
}: AddBillModalProps) {
  const { addBill, updateBill } = useBills();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = flatId || getCurrentFlatId();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BillFormData>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDay: 1,
      category: "RENT",
      splitType: "EQUAL",
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or bill changes
  useEffect(() => {
    if (isOpen) {
      if (bill) {
        reset({
          name: bill.name,
          amount: bill.amount,
          dueDay: bill.dueDay,
          category: bill.category,
          splitType: bill.splitType,
          isActive: bill.isActive,
        });
      } else {
        reset({
          name: "",
          amount: 0,
          dueDay: 1,
          category: "RENT",
          splitType: "EQUAL",
          isActive: true,
        });
      }
    }
  }, [isOpen, bill, reset]);

  const onSubmit = (data: BillFormData) => {
    if (bill) {
      // Edit mode
      updateBill(bill.id, {
        name: data.name,
        amount: data.amount,
        dueDay: data.dueDay,
        category: data.category,
        splitType: data.splitType,
        isActive: data.isActive,
      });
      success(`Bill "${data.name}" updated successfully`);
    } else {
      // Add mode
      addBill({
        flatId: currentFlatId,
        name: data.name,
        amount: data.amount,
        dueDay: data.dueDay,
        category: data.category,
        splitType: data.splitType,
        isActive: data.isActive,
      });
      success(`Bill "${data.name}" added successfully`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="add-bill-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}} // Controlled by parent
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {bill ? "Edit Bill" : "Add Bill"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Bill Name *"
                {...register("name")}
                error={errors.name?.message}
                placeholder="e.g., Rent, WiFi, Maid"
                autoFocus
              />

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
                label="Due Day *"
                type="number"
                min="1"
                max="31"
                {...register("dueDay", { valueAsNumber: true })}
                error={errors.dueDay?.message}
                placeholder="1-31"
              />
              <p className="text-xs text-base-content/60">
                Day of the month when this bill is due
              </p>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("category")}
                >
                  {BILL_CATEGORIES.map((cat) => (
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
                  <span className="label-text">Split Type *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("splitType")}
                >
                  <option value="EQUAL">Equal</option>
                  <option value="WEIGHTED">Weighted</option>
                </select>
                {errors.splitType && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.splitType.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    {...register("isActive")}
                  />
                  <span className="label-text">Active bill</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {bill ? "Update" : "Add"} Bill
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}
