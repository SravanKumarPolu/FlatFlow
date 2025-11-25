import { useState, useMemo } from "react";
import {
  PageHeader,
  AddGuestModal,
  ConfirmDeleteModal,
  CheckOutGuestModal,
  GuestDetailModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button, Input } from "@flatflow/ui";
import { Guest, GuestType, PaymentStatus } from "@flatflow/core";
import { useGuests, useMembers, useFlat, useToast } from "../../hooks";

type SortField = "name" | "checkInDate" | "checkOutDate" | "stayDuration";
type SortDirection = "asc" | "desc";

export default function GuestTrackingPage() {
  const {
    guests,
    deleteGuest,
    getGuestsByFlatId,
    getActiveGuestsByFlatId,
    getGuestStayDuration,
    checkOutGuest,
  } = useGuests();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [detailGuest, setDetailGuest] = useState<Guest | null>(null);
  const [checkOutGuestState, setCheckOutGuestState] = useState<Guest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    guest: Guest | null;
  }>({ isOpen: false, guest: null });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [filterGuestType, setFilterGuestType] = useState<GuestType | "ALL">("ALL");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | "ALL">("ALL");
  const [filterRoomBed, setFilterRoomBed] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Sort & Pagination
  const [sortField, setSortField] = useState<SortField>("checkInDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter guests for current flat
  const allFlatGuests = useMemo(() => {
    if (!currentFlatId) return [];
    return getGuestsByFlatId(currentFlatId);
  }, [guests, currentFlatId, getGuestsByFlatId]);

  const activeFlatGuests = useMemo(() => {
    if (!currentFlatId) return [];
    return getActiveGuestsByFlatId(currentFlatId);
  }, [guests, currentFlatId, getActiveGuestsByFlatId]);

  // Apply filters
  const filteredGuests = useMemo(() => {
    let result = showActiveOnly ? activeFlatGuests : allFlatGuests;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (guest) =>
          guest.name.toLowerCase().includes(query) ||
          guest.phone?.toLowerCase().includes(query) ||
          guest.email?.toLowerCase().includes(query) ||
          guest.roomBed?.toLowerCase().includes(query)
      );
    }

    // Guest type filter
    if (filterGuestType !== "ALL") {
      result = result.filter((guest) => guest.guestType === filterGuestType);
    }

    // Payment status filter
    if (filterPaymentStatus !== "ALL") {
      result = result.filter((guest) => guest.paymentStatus === filterPaymentStatus);
    }

    // Room/Bed filter
    if (filterRoomBed) {
      result = result.filter(
        (guest) => guest.roomBed?.toLowerCase().includes(filterRoomBed.toLowerCase())
      );
    }

    // Date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      result = result.filter((guest) => new Date(guest.checkInDate) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      result = result.filter(
        (guest) =>
          !guest.checkInDate || new Date(guest.checkInDate) <= toDate
      );
    }

    return result;
  }, [
    allFlatGuests,
    activeFlatGuests,
    showActiveOnly,
    searchQuery,
    filterGuestType,
    filterPaymentStatus,
    filterRoomBed,
    filterDateFrom,
    filterDateTo,
  ]);

  // Sort guests
  const sortedGuests = useMemo(() => {
    const sorted = [...filteredGuests].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "checkInDate":
          aValue = new Date(a.checkInDate).getTime();
          bValue = new Date(b.checkInDate).getTime();
          break;
        case "checkOutDate":
          aValue = a.checkOutDate
            ? new Date(a.checkOutDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          bValue = b.checkOutDate
            ? new Date(b.checkOutDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          break;
        case "stayDuration":
          aValue = getGuestStayDuration(a.id);
          bValue = getGuestStayDuration(b.id);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredGuests, sortField, sortDirection, getGuestStayDuration]);

  // Pagination
  const totalPages = Math.ceil(sortedGuests.length / itemsPerPage);
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedGuests.slice(start, start + itemsPerPage);
  }, [sortedGuests, currentPage, itemsPerPage]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCheckOut = (guest: Guest) => {
    setCheckOutGuestState(guest);
  };

  const handleCheckOutComplete = () => {
    setCheckOutGuestState(null);
    setDetailGuest(null);
  };

  // Get unique room/bed values for filter
  const uniqueRoomBeds = useMemo(() => {
    const rooms = new Set<string>();
    allFlatGuests.forEach((guest) => {
      if (guest.roomBed) rooms.add(guest.roomBed);
    });
    return Array.from(rooms).sort();
  }, [allFlatGuests]);

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

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 lg:col-span-4">
              <Input
                label="Search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, phone, email, room..."
              />
            </div>

            {/* Active Only Toggle */}
            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={showActiveOnly}
                  onChange={(e) => {
                    setShowActiveOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
                <span className="label-text">Active guests only</span>
              </label>
            </div>

            {/* Guest Type Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Guest Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filterGuestType}
                onChange={(e) => {
                  setFilterGuestType(e.target.value as GuestType | "ALL");
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Types</option>
                <option value="SHARING">Sharing</option>
                <option value="SINGLE">Single</option>
                <option value="SHORT_STAY">Short-stay</option>
                <option value="STAFF">Staff</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Payment Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filterPaymentStatus}
                onChange={(e) => {
                  setFilterPaymentStatus(e.target.value as PaymentStatus | "ALL");
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="WAIVED">Waived</option>
              </select>
            </div>

            {/* Room/Bed Filter */}
            {uniqueRoomBeds.length > 0 && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Room/Bed</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={filterRoomBed}
                  onChange={(e) => {
                    setFilterRoomBed(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Rooms</option>
                  {uniqueRoomBeds.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filters */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Check-in From</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={filterDateFrom}
                onChange={(e) => {
                  setFilterDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Check-in To</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={filterDateTo}
                onChange={(e) => {
                  setFilterDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="stats stats-horizontal shadow-sm mt-4">
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-lg">{filteredGuests.length}</div>
            </div>
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">Active</div>
              <div className="stat-value text-lg text-success">
                {activeFlatGuests.length}
              </div>
            </div>
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">Checked Out</div>
              <div className="stat-value text-lg">
                {allFlatGuests.length - activeFlatGuests.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest List */}
      {paginatedGuests.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">👤</span>}
              title="No guests found"
              description={
                searchQuery || filterGuestType !== "ALL" || filterPaymentStatus !== "ALL"
                  ? "Try adjusting your filters"
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
        <>
          {/* Sort Controls */}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-base-content/60">Sort by:</span>
              {(["name", "checkInDate", "checkOutDate", "stayDuration"] as SortField[]).map(
                (field) => (
                  <button
                    key={field}
                    className={`btn btn-sm ${
                      sortField === field ? "btn-primary" : "btn-ghost"
                    }`}
                    onClick={() => handleSort(field)}
                  >
                    {field === "checkInDate"
                      ? "Check-in"
                      : field === "checkOutDate"
                      ? "Check-out"
                      : field === "stayDuration"
                      ? "Duration"
                      : "Name"}
                    {sortField === field && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
            <div className="text-sm text-base-content/60">
              Showing {paginatedGuests.length} of {sortedGuests.length} guests
            </div>
          </div>

          <div className="space-y-4">
            {paginatedGuests.map((guest) => {
              const stayDuration = getGuestStayDuration(guest.id);
              const isActive = !guest.checkOutDate;

              return (
                <div
                  key={guest.id}
                  className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow border ${
                    isActive ? "border-success" : "border-base-300"
                  } cursor-pointer`}
                  onClick={() => setDetailGuest(guest)}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{guest.name}</h3>
                          {isActive && (
                            <span className="badge badge-success badge-sm">Active</span>
                          )}
                          <span className="badge badge-outline badge-sm">
                            {guest.guestType}
                          </span>
                          {guest.paymentStatus && (
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
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-base-content/60 mb-2">
                          <span>
                            Host: <strong>{getMemberName(guest.hostMemberId)}</strong>
                          </span>
                          {guest.roomBed && (
                            <>
                              <span>•</span>
                              <span>Room: <strong>{guest.roomBed}</strong></span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Check-in:{" "}
                            {new Date(guest.checkInDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {guest.checkOutDate && (
                            <>
                              <span>•</span>
                              <span>
                                Check-out:{" "}
                                {new Date(guest.checkOutDate).toLocaleDateString("en-IN", {
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
                        {guest.phone && (
                          <p className="text-sm text-base-content/60">
                            📞 {guest.phone}
                          </p>
                        )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckOut(guest);
                          }}
                        >
                          Check Out
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGuest(guest);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ isOpen: true, guest });
                        }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <AddGuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuest(null);
        }}
        guest={editingGuest}
      />

      <CheckOutGuestModal
        isOpen={!!checkOutGuestState}
        onClose={() => {
          setCheckOutGuestState(null);
          handleCheckOutComplete();
        }}
        guest={checkOutGuestState}
      />

      <GuestDetailModal
        isOpen={!!detailGuest}
        onClose={() => setDetailGuest(null)}
        guest={detailGuest}
        onEdit={() => {
          setEditingGuest(detailGuest);
          setDetailGuest(null);
          setIsModalOpen(true);
        }}
        onCheckOut={() => {
          if (detailGuest) {
            setCheckOutGuestState(detailGuest);
            setDetailGuest(null);
          }
        }}
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
