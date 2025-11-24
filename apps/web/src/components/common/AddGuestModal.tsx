import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Guest } from "@flatflow/core";
import { useGuests, useMembers, useFlat, useToast } from "../../hooks";
import { guestFormSchema, type GuestFormData } from "../../lib/validation";

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: Guest | null; // If provided, edit mode
}

export function AddGuestModal({ isOpen, onClose, guest }: AddGuestModalProps) {
  const { addGuest, updateGuest } = useGuests();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const flatMembers = members.filter((m) => m.flatId === currentFlatId && m.isActive);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      hostMemberId: "",
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (guest) {
        reset({
          name: guest.name,
          hostMemberId: guest.hostMemberId,
          checkInDate: guest.checkInDate.split("T")[0],
          checkOutDate: guest.checkOutDate ? guest.checkOutDate.split("T")[0] : "",
          notes: guest.notes || "",
        });
      } else {
        reset({
          name: "",
          hostMemberId: flatMembers.length > 0 ? flatMembers[0].id : "",
          checkInDate: new Date().toISOString().split("T")[0],
          checkOutDate: "",
          notes: "",
        });
      }
    }
  }, [isOpen, guest, flatMembers, reset]);

  const onSubmit = (data: GuestFormData) => {
    if (!currentFlatId) {
      return;
    }

    if (guest) {
      updateGuest(guest.id, {
        name: data.name,
        hostMemberId: data.hostMemberId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate || undefined,
        notes: data.notes || undefined,
      });
      success(`Guest "${data.name}" updated successfully`);
    } else {
      addGuest({
        flatId: currentFlatId,
        name: data.name,
        hostMemberId: data.hostMemberId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate || undefined,
        notes: data.notes || undefined,
      });
      success(`Guest "${data.name}" added successfully`);
    }
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
        id="add-guest-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {guest ? "Edit Guest" : "Add Guest"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Guest Name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g., John Doe"
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text">Host Member</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("hostMemberId")}
              >
                <option value="">Select host member</option>
                {flatMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.emoji} {member.name}
                  </option>
                ))}
              </select>
              {errors.hostMemberId && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.hostMemberId.message}
                  </span>
                </label>
              )}
            </div>

            <Input
              label="Check-in Date"
              type="date"
              {...register("checkInDate")}
              error={errors.checkInDate?.message}
            />

            <Input
              label="Check-out Date (Optional)"
              type="date"
              {...register("checkOutDate")}
              error={errors.checkOutDate?.message}
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                {...register("notes")}
                placeholder="Add any notes about the guest..."
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
                  ? "Saving..."
                  : guest
                    ? "Update Guest"
                    : "Add Guest"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

