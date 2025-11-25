import { useState, useMemo } from "react";
import {
  PageHeader,
  AddChoreModal,
  CompleteChoreModal,
  ConfirmDeleteModal,
  ChoreCompletionHistoryModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button, Input } from "@flatflow/ui";
import { Chore, ChoreCategory } from "@flatflow/core";
import { useChores, useMembers, useFlat, useToast } from "../../hooks";
import {
  getChoreStatus,
  getDaysUntilDue,
  getFrequencyLabel,
  CHORE_STATUS_LABELS,
  type ChoreStatus,
} from "../../lib/choreUtils";

type SortField = "nextDueDate" | "category" | "member" | "name";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "overdue" | "due_today" | "upcoming";

export default function ChoresPage() {
  const {
    chores,
    deleteChore,
    getActiveChoresByFlatId,
    completeChore,
    rotateChore,
    getCompletionsByChoreId,
  } = useChores();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    chore: Chore | null;
  }>({ isOpen: false, chore: null });
  const [historyChore, setHistoryChore] = useState<Chore | null>(null);
  const [completingChore, setCompletingChore] = useState<Chore | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ChoreCategory | "all">("all");
  const [frequencyFilter, setFrequencyFilter] = useState<Chore["frequency"] | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("nextDueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter chores for current flat
  const flatChores = useMemo(() => {
    if (!currentFlatId) return [];
    return getActiveChoresByFlatId(currentFlatId);
  }, [chores, currentFlatId, getActiveChoresByFlatId]);

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

  const getCategoryIcon = (category: Chore["category"]) => {
    const icons: Record<Chore["category"], string> = {
      CLEANING: "🧹",
      KITCHEN: "🍳",
      BATHROOM: "🚿",
      TRASH: "🗑️",
      UTILITIES: "⚡",
      OTHER: "📋",
    };
    return icons[category] || "📋";
  };

  // Get completion count in last 30 days
  const getCompletionCount = (chore: Chore): number => {
    const completions = getCompletionsByChoreId(chore.id);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return completions.filter(
      (c) => new Date(c.completedAt) >= thirtyDaysAgo
    ).length;
  };

  // Filtered and sorted chores
  const filteredChores = useMemo(() => {
    let filtered = [...flatChores];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chore) =>
          chore.name.toLowerCase().includes(query) ||
          chore.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((chore) => chore.category === categoryFilter);
    }

    // Frequency filter
    if (frequencyFilter !== "all") {
      filtered = filtered.filter((chore) => chore.frequency === frequencyFilter);
    }

    // Assignee filter
    if (assigneeFilter !== "all") {
      filtered = filtered.filter(
        (chore) => chore.currentAssigneeId === assigneeFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((chore) => {
        const status = getChoreStatus(chore);
        return status === statusFilter;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "nextDueDate":
          aValue = a.nextDueDate ? new Date(a.nextDueDate).getTime() : 0;
          bValue = b.nextDueDate ? new Date(b.nextDueDate).getTime() : 0;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "member":
          aValue = getMemberName(a.currentAssigneeId);
          bValue = getMemberName(b.currentAssigneeId);
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    flatChores,
    searchQuery,
    categoryFilter,
    frequencyFilter,
    assigneeFilter,
    statusFilter,
    sortField,
    sortOrder,
    flatMembers,
  ]);

  // Group chores by status
  const groupedChores = useMemo(() => {
    const groups: {
      overdue: Chore[];
      due_today: Chore[];
      upcoming: Chore[];
    } = {
      overdue: [],
      due_today: [],
      upcoming: [],
    };

    filteredChores.forEach((chore) => {
      const status = getChoreStatus(chore);
      groups[status].push(chore);
    });

    return groups;
  }, [filteredChores]);

  const handleComplete = (chore: Chore) => {
    if (!chore.currentAssigneeId) return;
    setCompletingChore(chore);
  };

  const handleRotate = (chore: Chore) => {
    rotateChore(chore.id);
    success(`Chore "${chore.name}" rotated to next person`);
  };

  const handleDelete = (chore: Chore) => {
    deleteChore(chore.id);
    success(`Chore "${chore.name}" deleted`);
    setDeleteConfirm({ isOpen: false, chore: null });
  };

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle="Manage household chores and rotations"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingChore(null);
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
            Add Chore
          </Button>
        }
      />

      {flatChores.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">🧹</span>}
              title="No chores yet"
              description="Add chores to track household tasks and rotations."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingChore(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Chore
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Search</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Search chores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(e.target.value as ChoreCategory | "all")
                    }
                  >
                    <option value="all">All Categories</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="BATHROOM">Bathroom</option>
                    <option value="TRASH">Trash</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Frequency Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Frequency</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={frequencyFilter}
                    onChange={(e) =>
                      setFrequencyFilter(
                        e.target.value as Chore["frequency"] | "all"
                      )
                    }
                  >
                    <option value="all">All Frequencies</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BI_WEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Assigned To</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                  >
                    <option value="all">All Members</option>
                    {flatMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.emoji} {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                  >
                    <option value="all">All Status</option>
                    <option value="overdue">{CHORE_STATUS_LABELS.overdue}</option>
                    <option value="due_today">{CHORE_STATUS_LABELS.due_today}</option>
                    <option value="upcoming">{CHORE_STATUS_LABELS.upcoming}</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sort By</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="select select-bordered flex-1"
                      value={sortField}
                      onChange={(e) =>
                        setSortField(e.target.value as SortField)
                      }
                    >
                      <option value="nextDueDate">Due Date</option>
                      <option value="category">Category</option>
                      <option value="member">Member</option>
                      <option value="name">Name</option>
                    </select>
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chores List - Grouped by Status */}
          {filteredChores.length === 0 ? (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <EmptyState
                  icon={<span className="text-5xl">🔍</span>}
                  title="No chores found"
                  description="Try adjusting your filters or search query."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overdue */}
              {groupedChores.overdue.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="badge badge-error badge-lg">
                      {CHORE_STATUS_LABELS.overdue}
                    </span>
                    <span className="text-base-content/60">
                      ({groupedChores.overdue.length})
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {groupedChores.overdue.map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        getMemberName={getMemberName}
                        getCategoryIcon={getCategoryIcon}
                        getCompletionCount={getCompletionCount}
                        onComplete={handleComplete}
                        onRotate={handleRotate}
                        onEdit={() => {
                          setEditingChore(chore);
                          setIsModalOpen(true);
                        }}
                        onDelete={() =>
                          setDeleteConfirm({ isOpen: true, chore })
                        }
                        onViewHistory={() => setHistoryChore(chore)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Due Today */}
              {groupedChores.due_today.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="badge badge-warning badge-lg">
                      {CHORE_STATUS_LABELS.due_today}
                    </span>
                    <span className="text-base-content/60">
                      ({groupedChores.due_today.length})
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {groupedChores.due_today.map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        getMemberName={getMemberName}
                        getCategoryIcon={getCategoryIcon}
                        getCompletionCount={getCompletionCount}
                        onComplete={handleComplete}
                        onRotate={handleRotate}
                        onEdit={() => {
                          setEditingChore(chore);
                          setIsModalOpen(true);
                        }}
                        onDelete={() =>
                          setDeleteConfirm({ isOpen: true, chore })
                        }
                        onViewHistory={() => setHistoryChore(chore)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {groupedChores.upcoming.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="badge badge-info badge-lg">
                      {CHORE_STATUS_LABELS.upcoming}
                    </span>
                    <span className="text-base-content/60">
                      ({groupedChores.upcoming.length})
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {groupedChores.upcoming.map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        getMemberName={getMemberName}
                        getCategoryIcon={getCategoryIcon}
                        getCompletionCount={getCompletionCount}
                        onComplete={handleComplete}
                        onRotate={handleRotate}
                        onEdit={() => {
                          setEditingChore(chore);
                          setIsModalOpen(true);
                        }}
                        onDelete={() =>
                          setDeleteConfirm({ isOpen: true, chore })
                        }
                        onViewHistory={() => setHistoryChore(chore)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddChoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChore(null);
        }}
        chore={editingChore}
      />

      <CompleteChoreModal
        isOpen={!!completingChore}
        onClose={() => setCompletingChore(null)}
        chore={completingChore}
      />

      {historyChore && (
        <ChoreCompletionHistoryModal
          isOpen={!!historyChore}
          onClose={() => setHistoryChore(null)}
          chore={historyChore}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, chore: null })}
        onConfirm={() => {
          if (deleteConfirm.chore) {
            handleDelete(deleteConfirm.chore);
          }
        }}
        title="Delete Chore"
        message={
          deleteConfirm.chore
            ? `Are you sure you want to delete "${deleteConfirm.chore.name}"? This action cannot be undone.`
            : ""
        }
      />
    </>
  );
}

// Chore Card Component
interface ChoreCardProps {
  chore: Chore;
  getMemberName: (id: string) => string;
  getCategoryIcon: (category: Chore["category"]) => string;
  getCompletionCount: (chore: Chore) => number;
  onComplete: (chore: Chore) => void;
  onRotate: (chore: Chore) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewHistory: () => void;
}

function ChoreCard({
  chore,
  getMemberName,
  getCategoryIcon,
  getCompletionCount,
  onComplete,
  onRotate,
  onEdit,
  onDelete,
  onViewHistory,
}: ChoreCardProps) {
  const status = getChoreStatus(chore);
  const daysUntilDue = getDaysUntilDue(chore);
  const completionCount = getCompletionCount(chore);
  const isRecentlyCompleted =
    chore.lastCompletedAt &&
    new Date(chore.lastCompletedAt) >=
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

  const statusBadge = {
    overdue: (
      <span className="badge badge-error">
        {CHORE_STATUS_LABELS.overdue}
        {daysUntilDue && daysUntilDue < 0 ? ` (${Math.abs(daysUntilDue)} days)` : ""}
      </span>
    ),
    due_today: (
      <span className="badge badge-warning">{CHORE_STATUS_LABELS.due_today}</span>
    ),
    upcoming: (
      <span className="badge badge-info">
        {CHORE_STATUS_LABELS.upcoming}
        {daysUntilDue !== null && daysUntilDue > 0
          ? ` (${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""})`
          : ""}
      </span>
    ),
  };

  return (
    <div
      className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow border ${
        status === "overdue"
          ? "border-error"
          : status === "due_today"
            ? "border-warning"
            : "border-base-300"
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-3xl">{getCategoryIcon(chore.category)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{chore.name}</h3>
                {statusBadge[status]}
                {isRecentlyCompleted && (
                  <span className="badge badge-success badge-sm">
                    Completed Recently
                  </span>
                )}
              </div>
              {chore.description && (
                <p className="text-sm text-base-content/60 mb-2">
                  {chore.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
                <span className="badge badge-outline">{chore.category}</span>
                <span className="badge badge-outline">
                  {getFrequencyLabel(chore.frequency)}
                </span>
                <span>•</span>
                <span>
                  Assigned to: <strong>{getMemberName(chore.currentAssigneeId)}</strong>
                </span>
                {chore.nextDueDate && (
                  <>
                    <span>•</span>
                    <span>
                      Due:{" "}
                      {new Date(chore.nextDueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
                {chore.lastCompletedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Last completed:{" "}
                      {new Date(chore.lastCompletedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                        }
                      )}
                    </span>
                  </>
                )}
                {completionCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-success">
                      Completed {completionCount} time
                      {completionCount !== 1 ? "s" : ""} in last 30 days
                    </span>
                  </>
                )}
                {status === "overdue" && chore.lastCompletedAt && (
                  <>
                    <span>•</span>
                    <span className="text-error font-medium">
                      Skipped last due date
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onViewHistory}
          >
            History
          </Button>
          {chore.rotationEnabled && chore.rotationOrder.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRotate(chore)}
            >
              Rotate
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onComplete(chore)}
            disabled={!chore.currentAssigneeId}
          >
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
