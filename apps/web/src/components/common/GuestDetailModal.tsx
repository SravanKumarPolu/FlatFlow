import { useMemo } from "react";
import { Button } from "@flatflow/ui";
import { Guest } from "@flatflow/core";
import { useGuests, useMembers } from "../../hooks";

interface GuestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onEdit?: () => void;
  onCheckOut?: () => void;
}

export function GuestDetailModal({
  isOpen,
  onClose,
  guest,
  onEdit,
  onCheckOut,
}: GuestDetailModalProps) {
  const { getGuestStayDuration } = useGuests();
  const { members } = useMembers();

  const stayDuration = useMemo(() => {
    if (!guest) return 0;
    return getGuestStayDuration(guest.id);
  }, [guest, getGuestStayDuration]);

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen || !guest) return null;

  const isActive = !guest.checkOutDate;

  return (
    <>
      <input
        type="checkbox"
        id="guest-detail-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Guest Details</h3>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{guest.name}</h4>
                  {isActive && (
                    <span className="badge badge-success">Active</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {guest.phone && (
                    <div>
                      <span className="text-base-content/60">Phone:</span>{" "}
                      <span className="font-medium">{guest.phone}</span>
                    </div>
                  )}
                  {guest.email && (
                    <div>
                      <span className="text-base-content/60">Email:</span>{" "}
                      <span className="font-medium">{guest.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-base-content/60">Guest Type:</span>{" "}
                    <span className="font-medium">{guest.guestType}</span>
                  </div>
                  {guest.roomBed && (
                    <div>
                      <span className="text-base-content/60">Room/Bed:</span>{" "}
                      <span className="font-medium">{guest.roomBed}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ID Proof */}
            {(guest.idProofType || guest.idProofNumber) && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h4 className="font-semibold mb-2">ID Proof</h4>
                  <div className="text-sm space-y-1">
                    {guest.idProofType && (
                      <div>
                        <span className="text-base-content/60">Type:</span>{" "}
                        <span className="font-medium">{guest.idProofType}</span>
                      </div>
                    )}
                    {guest.idProofNumber && (
                      <div>
                        <span className="text-base-content/60">Number:</span>{" "}
                        <span className="font-medium">{guest.idProofNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stay Information */}
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-semibold mb-2">Stay Information</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-base-content/60">Host:</span>{" "}
                    <span className="font-medium">
                      {getMemberName(guest.hostMemberId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-base-content/60">Check-in:</span>{" "}
                    <span className="font-medium">{formatDate(guest.checkInDate)}</span>
                  </div>
                  {guest.expectedCheckOutDate && (
                    <div>
                      <span className="text-base-content/60">Expected Check-out:</span>{" "}
                      <span className="font-medium">
                        {formatDate(guest.expectedCheckOutDate)}
                      </span>
                    </div>
                  )}
                  {guest.checkOutDate && (
                    <div>
                      <span className="text-base-content/60">Check-out:</span>{" "}
                      <span className="font-medium">{formatDate(guest.checkOutDate)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-base-content/60">Stay Duration:</span>{" "}
                    <span className="font-medium">
                      {stayDuration} day{stayDuration !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {guest.paymentStatus && (
                    <div>
                      <span className="text-base-content/60">Payment Status:</span>{" "}
                      <span
                        className={`badge badge-sm ${
                          guest.paymentStatus === "PAID"
                            ? "badge-success"
                            : guest.paymentStatus === "PARTIAL"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {guest.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {guest.notes && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm italic">{guest.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-action mt-4">
            {isActive && onCheckOut && (
              <Button variant="primary" onClick={onCheckOut}>
                Check Out
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

