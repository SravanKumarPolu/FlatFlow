import { useState, useMemo } from "react";
import {
  PageHeader,
  AddSettlementModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Settlement } from "@flatflow/core";
import { useSettlements, useMembers, useFlat, useToast } from "../../hooks";

export default function SettlementsPage() {
  const { settlements, deleteSettlement, getSettlementsByFlatId } =
    useSettlements();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success, error } = useToast();
  const currentFlatId = getCurrentFlatId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    settlement: Settlement | null;
  }>({ isOpen: false, settlement: null });

  // Get settlements for current flat
  const flatSettlements = useMemo(() => {
    return getSettlementsByFlatId(currentFlatId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [settlements, currentFlatId, getSettlementsByFlatId]);

  // Helper to get member name by ID
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  return (
    <>
      <PageHeader
        title="Settlements"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingSettlement(null);
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
            Record Settlement
          </Button>
        }
      />

      {flatSettlements.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">💸</span>}
              title="No settlements yet"
              description="Record payments between members to track who has paid whom."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingSettlement(null);
                    setIsModalOpen(true);
                  }}
                >
                  Record Your First Settlement
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {flatSettlements.map((settlement) => (
            <div
              key={settlement.id}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getMemberName(settlement.fromMemberId)}
                      </span>
                      <span className="text-base-content/60">→</span>
                      <span className="text-lg">
                        {getMemberName(settlement.toMemberId)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
                      <span>
                        {new Date(settlement.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {settlement.note && (
                        <>
                          <span>•</span>
                          <span>{settlement.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(settlement.amount)}
                    </p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingSettlement(settlement);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeleteConfirm({ isOpen: true, settlement });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSettlementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSettlement(null);
        }}
        settlement={editingSettlement}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, settlement: null })}
        onConfirm={() => {
          if (deleteConfirm.settlement) {
            try {
              deleteSettlement(deleteConfirm.settlement.id);
              success("Settlement deleted successfully");
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : "Failed to delete settlement";
              error(errorMessage);
            }
          }
        }}
        title="Delete Settlement"
        message={`Are you sure you want to delete this settlement?`}
        itemName="settlement"
      />
    </>
  );
}
