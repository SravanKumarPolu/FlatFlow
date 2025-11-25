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
      phone: "",
      email: "",
      idProofType: undefined,
      idProofNumber: "",
      guestType: "SHARING",
      hostMemberId: "",
      roomBed: "",
      checkInDate: new Date().toISOString().split("T")[0],
      expectedCheckOutDate: "",
      checkOutDate: "",
      paymentStatus: "PENDING",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (guest) {
        reset({
          name: guest.name,
          phone: guest.phone || "",
          email: guest.email || "",
          idProofType: guest.idProofType,
          idProofNumber: guest.idProofNumber || "",
          guestType: guest.guestType,
          hostMemberId: guest.hostMemberId,
          roomBed: guest.roomBed || "",
          checkInDate: guest.checkInDate.split("T")[0],
          expectedCheckOutDate: guest.expectedCheckOutDate
            ? guest.expectedCheckOutDate.split("T")[0]
            : "",
          checkOutDate: guest.checkOutDate ? guest.checkOutDate.split("T")[0] : "",
          paymentStatus: guest.paymentStatus || "PENDING",
          notes: guest.notes || "",
        });
      } else {
        reset({
          name: "",
          phone: "",
          email: "",
          idProofType: undefined,
          idProofNumber: "",
          guestType: "SHARING",
          hostMemberId: flatMembers.length > 0 ? flatMembers[0].id : "",
          roomBed: "",
          checkInDate: new Date().toISOString().split("T")[0],
          expectedCheckOutDate: "",
          checkOutDate: "",
          paymentStatus: "PENDING",
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
        phone: data.phone || undefined,
        email: data.email || undefined,
        idProofType: data.idProofType,
        idProofNumber: data.idProofNumber || undefined,
        guestType: data.guestType,
        hostMemberId: data.hostMemberId,
        roomBed: data.roomBed || undefined,
        checkInDate: data.checkInDate,
        expectedCheckOutDate: data.expectedCheckOutDate || undefined,
        checkOutDate: data.checkOutDate || undefined,
        paymentStatus: data.paymentStatus,
        notes: data.notes || undefined,
      });
      success(`Guest "${data.name}" updated successfully`);
    } else {
      addGuest({
        flatId: currentFlatId,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        idProofType: data.idProofType,
        idProofNumber: data.idProofNumber || undefined,
        guestType: data.guestType,
        hostMemberId: data.hostMemberId,
        roomBed: data.roomBed || undefined,
        checkInDate: data.checkInDate,
        expectedCheckOutDate: data.expectedCheckOutDate || undefined,
        checkOutDate: data.checkOutDate || undefined,
        paymentStatus: data.paymentStatus,
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
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">
            {guest ? "Edit Guest" : "Add Guest"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Guest Name *"
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g., John Doe"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone (Optional)"
                type="tel"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="+91 98765 43210"
              />

              <Input
                label="Email (Optional)"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Guest Type *</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("guestType")}
              >
                <option value="SHARING">Sharing</option>
                <option value="SINGLE">Single</option>
                <option value="SHORT_STAY">Short-stay</option>
                <option value="STAFF">Staff</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.guestType && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.guestType.message}
                  </span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ID Proof Type (Optional)</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  {...register("idProofType")}
                >
                  <option value="">None</option>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="ID Proof Number (Optional)"
                {...register("idProofNumber")}
                error={errors.idProofNumber?.message}
                placeholder="Enter ID number"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Host Member *</span>
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
              label="Room/Bed (Optional)"
              {...register("roomBed")}
              error={errors.roomBed?.message}
              placeholder="e.g., Room 1 - Bed A"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Check-in Date *"
                type="date"
                {...register("checkInDate")}
                error={errors.checkInDate?.message}
              />

              <Input
                label="Expected Check-out Date (Optional)"
                type="date"
                {...register("expectedCheckOutDate")}
                error={errors.expectedCheckOutDate?.message}
              />
            </div>

            {guest && (
              <Input
                label="Check-out Date (Optional)"
                type="date"
                {...register("checkOutDate")}
                error={errors.checkOutDate?.message}
              />
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Payment Status (Optional)</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("paymentStatus")}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="WAIVED">Waived</option>
              </select>
            </div>

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

