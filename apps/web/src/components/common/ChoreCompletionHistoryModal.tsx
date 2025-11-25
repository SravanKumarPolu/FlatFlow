import { useMemo } from "react";
import { Button } from "@flatflow/ui";
import { Chore } from "@flatflow/core";
import { useChores, useMembers } from "../../hooks";

interface ChoreCompletionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chore: Chore;
}

function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ChoreCompletionHistoryModal({
  isOpen,
  onClose,
  chore,
}: ChoreCompletionHistoryModalProps) {
  const { getCompletionsByChoreId } = useChores();
  const { members } = useMembers();

  const completions = useMemo(() => {
    return getCompletionsByChoreId(chore.id);
  }, [chore.id, getCompletionsByChoreId]);

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="chore-completion-history-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-2">Completion History</h3>
          <div className="mb-4">
            <p className="text-lg font-semibold">{chore.name}</p>
            <p className="text-sm text-base-content/60">
              {chore.category} • {chore.frequency}
            </p>
          </div>

          {completions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/60">No completions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {completions.map((completion, index) => (
                <div
                  key={completion.id}
                  className="card bg-base-200 border border-base-300"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-primary">
                            #{completions.length - index}
                          </span>
                          <div className="divider divider-horizontal m-0"></div>
                          <div>
                            <p className="font-semibold">
                              Completed by {getMemberName(completion.completedByMemberId)}
                            </p>
                            <p className="text-sm text-base-content/60">
                              {formatDateFull(new Date(completion.completedAt))}
                            </p>
                          </div>
                        </div>
                        {completion.note && (
                          <div className="text-sm text-base-content/60 mt-2">
                            <p className="italic">Note: {completion.note}</p>
                          </div>
                        )}
                        <p className="text-xs text-base-content/40 mt-2">
                          Recorded: {formatDateFull(new Date(completion.createdAt))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-action">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

