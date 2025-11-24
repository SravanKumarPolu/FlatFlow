import { useState, useMemo } from "react";
import {
  PageHeader,
  AddChoreModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Chore } from "@flatflow/core";
import { useChores, useMembers, useFlat, useToast } from "../../hooks";

export default function ChoresPage() {
  const { chores, deleteChore, getActiveChoresByFlatId, completeChore, rotateChore } =
    useChores();
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

  const handleComplete = (chore: Chore) => {
    if (!chore.currentAssigneeId) return;
    completeChore(chore.id, chore.currentAssigneeId);
    success(`Chore "${chore.name}" marked as complete!`);
  };

  const handleRotate = (chore: Chore) => {
    rotateChore(chore.id);
    success(`Chore "${chore.name}" rotated to next person`);
  };

  const getDaysSinceCompletion = (chore: Chore) => {
    if (!chore.lastCompletedAt) return null;
    const lastCompleted = new Date(chore.lastCompletedAt);
    const now = new Date();
    const diffTime = now.getTime() - lastCompleted.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <div className="space-y-4">
          {flatChores.map((chore) => {
            const daysSince = getDaysSinceCompletion(chore);
            const isOverdue =
              daysSince !== null &&
              ((chore.frequency === "DAILY" && daysSince >= 1) ||
                (chore.frequency === "WEEKLY" && daysSince >= 7) ||
                (chore.frequency === "BIWEEKLY" && daysSince >= 14) ||
                (chore.frequency === "MONTHLY" && daysSince >= 30));

            return (
              <div
                key={chore.id}
                className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow border ${
                  isOverdue ? "border-warning" : "border-base-300"
                }`}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{getCategoryIcon(chore.category)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{chore.name}</h3>
                        {chore.description && (
                          <p className="text-sm text-base-content/60 mb-2">
                            {chore.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
                          <span className="badge badge-outline">{chore.category}</span>
                          <span className="badge badge-outline">
                            {chore.frequency}
                          </span>
                          <span>•</span>
                          <span>
                            Assigned to: <strong>{getMemberName(chore.currentAssigneeId)}</strong>
                          </span>
                          {chore.lastCompletedAt && (
                            <>
                              <span>•</span>
                              <span>
                                Last completed: {new Date(chore.lastCompletedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                                {daysSince !== null && ` (${daysSince} day${daysSince !== 1 ? "s" : ""} ago)`}
                              </span>
                            </>
                          )}
                          {isOverdue && (
                            <>
                              <span>•</span>
                              <span className="badge badge-warning">Overdue</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleComplete(chore)}
                      disabled={!chore.currentAssigneeId}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRotate(chore)}
                      disabled={chore.rotationOrder.length < 2}
                    >
                      Rotate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingChore(chore);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ isOpen: true, chore })}
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

      <AddChoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChore(null);
        }}
        chore={editingChore}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, chore: null })}
        onConfirm={() => {
          if (deleteConfirm.chore) {
            deleteChore(deleteConfirm.chore.id);
            success(`Chore "${deleteConfirm.chore.name}" deleted successfully`);
          }
        }}
        title="Delete Chore"
        message={`Are you sure you want to delete "${deleteConfirm.chore?.name}"?`}
        itemName={deleteConfirm.chore?.name}
      />
    </>
  );
}

