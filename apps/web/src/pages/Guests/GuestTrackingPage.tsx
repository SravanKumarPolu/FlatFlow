import { useState, useMemo } from "react";
import {
  PageHeader,
  AddGuestModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Guest } from "@flatflow/core";
import { useGuests, useMembers, useFlat, useToast } from "../../hooks";

export default function GuestTrackingPage() {
  const { guests, deleteGuest, getGuestsByFlatId, getActiveGuestsByFlatId, getGuestStayDuration, checkOutGuest } =
    useGuests();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    guest: Guest | null;
  }>({ isOpen: false, guest: null });
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filter guests for current flat
  const allFlatGuests = useMemo(() => {
    if (!currentFlatId) return [];
    return getGuestsByFlatId(currentFlatId);
  }, [guests, currentFlatId, getGuestsByFlatId]);

  const activeFlatGuests = useMemo(() => {
    if (!currentFlatId) return [];
    return getActiveGuestsByFlatId(currentFlatId);
  }, [guests, currentFlatId, getActiveGuestsByFlatId]);

  const displayGuests = showActiveOnly ? activeFlatGuests : allFlatGuests;

  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  const getMemberName = (memberId: string) => {
    const member = flatMembers.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  const handleCheckOut = (guest: Guest) => {
    checkOutGuest(guest.id);
    success(`Guest "${guest.name}" checked out successfully`);
  };

  return (
    <>
      <PageHeader
        title="Guest Tracking"
        subtitle="Track guests and their stay duration"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingGuest(null);
              setIsModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Guest
          </Button>
        }
      />

      {/* Filter Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <div className="form-control">
          <label className="cursor-pointer label justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span className="label-text">Show active guests only</span>
          </label>
        </div>
        {!showActiveOnly && (
          <div className="stats stats-horizontal shadow-sm">
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">Total Guests</div>
              <div className="stat-value text-lg">{allFlatGuests.length}</div>
            </div>
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">Active</div>
              <div className="stat-value text-lg text-success">{activeFlatGuests.length}</div>
            </div>
          </div>
        )}
      </div>

      {displayGuests.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">👤</span>}
              title={showActiveOnly ? "No active guests" : "No guests yet"}
              description={
                showActiveOnly
                  ? "No guests are currently staying. Add a guest to track their stay."
                  : "Add guests to track their stay duration and manage fair adjustments."
              }
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingGuest(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Guest
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayGuests.map((guest) => {
            const stayDuration = getGuestStayDuration(guest.id);
            const isActive = !guest.checkOutDate;

            return (
              <div
                key={guest.id}
                className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow border ${
                  isActive ? "border-success" : "border-base-300"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{guest.name}</h3>
                        {isActive && (
                          <span className="badge badge-success badge-sm">Active</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-base-content/60 mb-2">
                        <span>
                          Host: <strong>{getMemberName(guest.hostMemberId)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Check-in: {new Date(guest.checkInDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {guest.checkOutDate && (
                          <>
                            <span>•</span>
                            <span>
                              Check-out: {new Date(guest.checkOutDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          Duration: <strong>{stayDuration} day{stayDuration !== 1 ? "s" : ""}</strong>
                        </span>
                      </div>
                      {guest.notes && (
                        <p className="text-sm text-base-content/60 mt-2 italic">
                          "{guest.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    {isActive && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCheckOut(guest)}
                      >
                        Check Out
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingGuest(guest);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ isOpen: true, guest })}
                      className="text-error"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddGuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuest(null);
        }}
        guest={editingGuest}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, guest: null })}
        onConfirm={() => {
          if (deleteConfirm.guest) {
            deleteGuest(deleteConfirm.guest.id);
            success(`Guest "${deleteConfirm.guest.name}" deleted successfully`);
          }
        }}
        title="Delete Guest"
        message={`Are you sure you want to delete "${deleteConfirm.guest?.name}"?`}
        itemName={deleteConfirm.guest?.name}
      />
    </>
  );
}

