import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@flatflow/ui";
import { useEmergencyFund, useFlat, useToast } from "../../hooks";

const fundNameSchema = z.object({
  name: z.string().optional().or(z.literal("")),
});

type FundNameFormData = z.infer<typeof fundNameSchema>;

interface EditFundNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
}

export function EditFundNameModal({
  isOpen,
  onClose,
  currentName,
}: EditFundNameModalProps) {
  const { updateFundName } = useEmergencyFund();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FundNameFormData>({
    resolver: zodResolver(fundNameSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: currentName || "",
      });
    }
  }, [isOpen, currentName, reset]);

  const onSubmit = (data: FundNameFormData) => {
    if (!currentFlatId) {
      return;
    }

    updateFundName(currentFlatId, data.name || undefined);
    success("Fund name updated successfully");
    reset();
    onClose();
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
        id="edit-fund-name-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Fund Name</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Fund Name (Optional)"
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g., Main Emergency Fund"
            />

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
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

