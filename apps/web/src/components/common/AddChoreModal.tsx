import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Chore } from "@flatflow/core";
import { useChores, useMembers, useFlat, useToast } from "../../hooks";
import { choreFormSchema, type ChoreFormData } from "../../lib/validation";

interface AddChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  chore?: Chore | null; // If provided, edit mode
}

export function AddChoreModal({ isOpen, onClose, chore }: AddChoreModalProps) {
  const { addChore, updateChore } = useChores();
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
    watch,
    setValue,
  } = useForm<ChoreFormData>({
    resolver: zodResolver(choreFormSchema),
    defaultValues: {
      name: "",
      category: "CLEANING",
      description: "",
      rotationOrder: [],
      currentAssigneeId: "",
      frequency: "WEEKLY",
      isActive: true,
    },
  });

  const selectedRotation = watch("rotationOrder");

  useEffect(() => {
    if (isOpen) {
      if (chore) {
        reset({
          name: chore.name,
          category: chore.category,
          description: chore.description || "",
          rotationOrder: chore.rotationOrder,
          currentAssigneeId: chore.currentAssigneeId,
          frequency: chore.frequency,
          isActive: chore.isActive,
        });
      } else {
        reset({
          name: "",
          category: "CLEANING",
          description: "",
          rotationOrder: flatMembers.length > 0 ? [flatMembers[0].id] : [],
          currentAssigneeId: flatMembers.length > 0 ? flatMembers[0].id : "",
          frequency: "WEEKLY",
          isActive: true,
        });
      }
    }
  }, [isOpen, chore, flatMembers, reset]);

  const toggleMemberInRotation = (memberId: string) => {
    const current = watch("rotationOrder");
    if (current.includes(memberId)) {
      setValue("rotationOrder", current.filter((id) => id !== memberId));
      // If removing current assignee, update it
      if (watch("currentAssigneeId") === memberId) {
        const remaining = current.filter((id) => id !== memberId);
        if (remaining.length > 0) {
          setValue("currentAssigneeId", remaining[0]);
        }
      }
    } else {
      setValue("rotationOrder", [...current, memberId]);
      // If no current assignee, set the first one
      if (!watch("currentAssigneeId")) {
        setValue("currentAssigneeId", memberId);
      }
    }
  };

  const onSubmit = (data: ChoreFormData) => {
    if (!currentFlatId) {
      return;
    }

    if (chore) {
      updateChore(chore.id, {
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        rotationOrder: data.rotationOrder,
        currentAssigneeId: data.currentAssigneeId,
        frequency: data.frequency,
        isActive: data.isActive,
      });
      success(`Chore "${data.name}" updated successfully`);
    } else {
      addChore({
        flatId: currentFlatId,
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        rotationOrder: data.rotationOrder,
        currentAssigneeId: data.currentAssigneeId,
        frequency: data.frequency,
        isActive: data.isActive,
      });
      success(`Chore "${data.name}" added successfully`);
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
        id="add-chore-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">
            {chore ? "Edit Chore" : "Add New Chore"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Chore Name"
              {...register("name")}
              error={errors.name?.message}
              placeholder="e.g., Clean Kitchen"
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("category")}
              >
                <option value="CLEANING">🧹 Cleaning</option>
                <option value="KITCHEN">🍳 Kitchen</option>
                <option value="BATHROOM">🚿 Bathroom</option>
                <option value="TRASH">🗑️ Trash</option>
                <option value="UTILITIES">⚡ Utilities</option>
                <option value="OTHER">📋 Other</option>
              </select>
              {errors.category && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.category.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                {...register("description")}
                placeholder="Add any notes or instructions..."
                rows={3}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Frequency</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("frequency")}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
              {errors.frequency && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.frequency.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Rotation Members</span>
                <span className="label-text-alt text-error">
                  {errors.rotationOrder?.message}
                </span>
              </label>
              <div className="space-y-2 border border-base-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {flatMembers.length === 0 ? (
                  <p className="text-sm text-base-content/60">
                    No active members. Add members first.
                  </p>
                ) : (
                  flatMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-base-200 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedRotation.includes(member.id)}
                        onChange={() => toggleMemberInRotation(member.id)}
                      />
                      <span className="flex-1">
                        {member.emoji} {member.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Current Assignee</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register("currentAssigneeId")}
                disabled={selectedRotation.length === 0}
              >
                <option value="">
                  {selectedRotation.length === 0
                    ? "Select rotation members first"
                    : "Select assignee"}
                </option>
                {selectedRotation.map((memberId) => {
                  const member = flatMembers.find((m) => m.id === memberId);
                  return member ? (
                    <option key={memberId} value={memberId}>
                      {member.emoji} {member.name}
                    </option>
                  ) : null;
                })}
              </select>
              {errors.currentAssigneeId && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.currentAssigneeId.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="cursor-pointer label justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  {...register("isActive")}
                />
                <span className="label-text">Active</span>
              </label>
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
                  : chore
                    ? "Update Chore"
                    : "Add Chore"}
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={handleClose}></label>
      </div>
    </>
  );
}

