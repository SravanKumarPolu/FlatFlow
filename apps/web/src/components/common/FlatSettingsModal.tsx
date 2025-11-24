import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { useFlat, useToast } from "../../hooks";
import { flatFormSchema, type FlatFormData } from "../../lib/validation";

interface FlatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlatSettingsModal({
  isOpen,
  onClose,
}: FlatSettingsModalProps) {
  const { currentFlat, createFlat, updateCurrentFlat } = useFlat();
  const { success } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FlatFormData>({
    resolver: zodResolver(flatFormSchema),
    defaultValues: {
      name: "",
      city: "",
      billingCycleStartDay: 5,
      currency: "INR",
    },
  });

  // Reset form when modal opens/closes or flat changes
  useEffect(() => {
    if (isOpen) {
      if (currentFlat) {
        reset({
          name: currentFlat.name,
          city: currentFlat.city || "",
          billingCycleStartDay: currentFlat.billingCycleStartDay,
          currency: currentFlat.currency,
        });
      } else {
        reset({
          name: "",
          city: "",
          billingCycleStartDay: 5,
          currency: "INR",
        });
      }
    }
  }, [isOpen, currentFlat, reset]);

  const onSubmit = (data: FlatFormData) => {
    if (currentFlat) {
      // Update existing flat
      updateCurrentFlat({
        name: data.name,
        city: data.city || undefined,
        billingCycleStartDay: data.billingCycleStartDay,
      });
      success(`Flat "${data.name}" updated successfully`);
    } else {
      // Create new flat
      createFlat({
        name: data.name,
        city: data.city || undefined,
        billingCycleStartDay: data.billingCycleStartDay,
        currency: data.currency,
      });
      success(`Flat "${data.name}" created successfully`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="flat-settings-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}} // Controlled by parent
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {currentFlat ? "Edit Flat" : "Create Flat"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Flat Name *"
                {...register("name")}
                error={errors.name?.message}
                placeholder="e.g., Sunshine Apartments"
                autoFocus
              />

              <Input
                label="City"
                {...register("city")}
                error={errors.city?.message}
                placeholder="e.g., Bangalore"
              />

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Billing Cycle Start Day *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("billingCycleStartDay", { valueAsNumber: true })}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                      {day === 1
                        ? "st"
                        : day === 2
                        ? "nd"
                        : day === 3
                        ? "rd"
                        : "th"}{" "}
                      of each month
                    </option>
                  ))}
                </select>
                {errors.billingCycleStartDay && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.billingCycleStartDay.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm">
                  The billing cycle determines when monthly bills reset. Choose a
                  day between 1-28.
                </span>
              </div>
            </div>

            <div className="modal-action">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {currentFlat ? "Update" : "Create"} Flat
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}
