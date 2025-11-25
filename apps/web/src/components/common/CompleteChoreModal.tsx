import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@flatflow/ui";
import { Chore } from "@flatflow/core";
import { useChores, useMembers, useFlat, useToast } from "../../hooks";

const completeChoreSchema = z.object({
  note: z.string().optional().or(z.literal("")),
});

type CompleteChoreFormData = z.infer<typeof completeChoreSchema>;

interface CompleteChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  chore: Chore | null;
}

export function CompleteChoreModal({
  isOpen,
  onClose,
  chore,
}: CompleteChoreModalProps) {
  const { completeChore } = useChores();
  const { members } = useMembers();
  const { success } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompleteChoreFormData>({
    resolver: zodResolver(completeChoreSchema),
    defaultValues: {
      note: "",
    },
  });

  const onSubmit = (data: CompleteChoreFormData) => {
    if (!chore || !chore.currentAssigneeId) {
      return;
    }

    completeChore(chore.id, chore.currentAssigneeId, data.note || undefined);
    success(`Chore "${chore.name}" marked as complete!`);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !chore) return null;

  const assignedMember = members.find((m) => m.id === chore.currentAssigneeId);

  return (
    <>
      <input
        type="checkbox"
        id="complete-chore-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Mark Chore as Complete</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Chore</span>
              </label>
              <div className="input input-bordered bg-base-200">
                <span className="font-semibold">{chore.name}</span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Completed By</span>
              </label>
              <div className="input input-bordered bg-base-200">
                <span>
                  {assignedMember
                    ? `${assignedMember.emoji || ""} ${assignedMember.name}`.trim()
                    : `Member ${chore.currentAssigneeId.slice(-4)}`}
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Note (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                {...register("note")}
                placeholder="Add any notes about the completion..."
                rows={3}
              />
              {errors.note && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.note.message}
                  </span>
                </label>
              )}
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
                {isSubmitting ? "Completing..." : "Mark Complete"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

