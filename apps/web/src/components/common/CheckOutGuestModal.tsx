import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@flatflow/ui";
import { Guest } from "@flatflow/core";
import { useGuests, useBills, useMembers, useFlat, useToast } from "../../hooks";
import { calculateGuestAdjustments } from "../../lib/guestAdjustments";

const checkOutSchema = z.object({
  checkOutDate: z.string().min(1, "Check-out date is required"),
  notes: z.string().optional().or(z.literal("")),
});

type CheckOutFormData = z.infer<typeof checkOutSchema>;

interface CheckOutGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
}

export function CheckOutGuestModal({
  isOpen,
  onClose,
  guest,
}: CheckOutGuestModalProps) {
  const { checkOutGuest } = useGuests();
  const { getBillsByFlatId } = useBills();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CheckOutFormData>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      checkOutDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const checkOutDate = watch("checkOutDate");

  // Calculate stay duration and amounts
  const summary = useMemo(() => {
    if (!guest || !currentFlatId || !checkOutDate) {
      return null;
    }

    const checkIn = new Date(guest.checkInDate);
    const checkOut = new Date(checkOutDate);
    const stayDuration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (stayDuration <= 0) {
      return { stayDuration: 0, rentAmount: 0, utilityAmount: 0, adjustments: 0, total: 0 };
    }

    const flatBills = getBillsByFlatId(currentFlatId);
    const flatMembers = members.filter((m) => m.flatId === currentFlatId && m.isActive);
    const memberCount = flatMembers.length || 1;

    // Calculate pro-rated rent
    const rentBills = flatBills.filter(
      (b) => b.isActive && b.category === "RENT"
    );
    const monthlyRent = rentBills.reduce((sum, bill) => sum + bill.amount, 0);
    const daysInMonth = 30; // Simplified
    const dailyRent = monthlyRent / daysInMonth;
    const rentAmount = (dailyRent * stayDuration) / memberCount;

    // Calculate pro-rated utilities
    const utilityBills = flatBills.filter(
      (b) => b.isActive && b.category === "UTILITY"
    );
    const monthlyUtilities = utilityBills.reduce((sum, bill) => sum + bill.amount, 0);
    const dailyUtilities = monthlyUtilities / daysInMonth;
    const utilityAmount = (dailyUtilities * stayDuration) / memberCount;

    // Calculate guest adjustments
    const adjustments = calculateGuestAdjustments(
      [guest],
      members,
      flatBills,
      currentFlatId
    );
    const adjustmentAmount = adjustments.find(
      (a) => a.memberId === guest.hostMemberId
    )?.adjustmentAmount || 0;

    const total = rentAmount + utilityAmount + adjustmentAmount;

    return {
      stayDuration,
      rentAmount,
      utilityAmount,
      adjustments: adjustmentAmount,
      total,
    };
  }, [guest, currentFlatId, checkOutDate, members, getBillsByFlatId]);

  const onSubmit = (data: CheckOutFormData) => {
    if (!guest) return;

    checkOutGuest(guest.id, data.checkOutDate, data.notes || undefined);
    success(`Guest "${guest.name}" checked out successfully`);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !guest) return null;

  return (
    <>
      <input
        type="checkbox"
        id="checkout-guest-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Check Out Guest</h3>

          <div className="mb-4 p-4 bg-base-200 rounded-lg">
            <p className="font-semibold text-lg">{guest.name}</p>
            <p className="text-sm text-base-content/60">
              Check-in: {new Date(guest.checkInDate).toLocaleDateString("en-IN")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Check-out Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register("checkOutDate")}
              />
              {errors.checkOutDate && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.checkOutDate.message}
                  </span>
                </label>
              )}
            </div>

            {/* Amount Summary */}
            {summary && summary.stayDuration > 0 && (
              <div className="card bg-base-200 border border-base-300">
                <div className="card-body p-4">
                  <h4 className="font-semibold mb-3">Amount Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Stay Duration:</span>
                      <span className="font-semibold">
                        {summary.stayDuration} day{summary.stayDuration !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pro-rated Rent:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(summary.rentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pro-rated Utilities:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(summary.utilityAmount)}
                      </span>
                    </div>
                    {summary.adjustments !== 0 && (
                      <div className="flex justify-between">
                        <span>Adjustments:</span>
                        <span
                          className={`font-semibold ${
                            summary.adjustments > 0 ? "text-error" : "text-success"
                          }`}
                        >
                          {summary.adjustments > 0 ? "+" : ""}
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(summary.adjustments)}
                        </span>
                      </div>
                    )}
                    <div className="divider my-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(summary.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                {...register("notes")}
                placeholder="Reason for leaving, comments, etc..."
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
                {isSubmitting ? "Checking Out..." : "Check Out"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

