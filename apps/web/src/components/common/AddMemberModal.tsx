import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@flatflow/ui";
import { Member } from "@flatflow/core";
import { useMembers, useFlat, useToast } from "../../hooks";
import { memberFormSchema, type MemberFormData } from "../../lib/validation";
import { logError } from "../../lib/logger";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null; // If provided, edit mode
  flatId?: string;
}

export function AddMemberModal({
  isOpen,
  onClose,
  member,
  flatId,
}: AddMemberModalProps) {
  const { addMember, updateMember } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { success, error } = useToast();
  const currentFlatId = flatId || getCurrentFlatId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      emoji: "",
      weight: 1,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or member changes
  useEffect(() => {
    if (isOpen) {
      if (member) {
        reset({
          name: member.name,
          emoji: member.emoji || "",
          weight: member.weight,
          isActive: member.isActive,
        });
      } else {
        reset({
          name: "",
          emoji: "",
          weight: 1,
          isActive: true,
        });
      }
    }
  }, [isOpen, member, reset]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      if (member) {
        // Edit mode
        updateMember(member.id, {
          name: data.name,
          emoji: data.emoji || undefined,
          weight: data.weight,
          isActive: data.isActive,
        });
        success(`Member "${data.name}" updated successfully`);
      } else {
        // Add mode
        if (!currentFlatId) {
          error("Please create a flat first");
          return;
        }
        addMember({
          flatId: currentFlatId,
          name: data.name,
          emoji: data.emoji || undefined,
          weight: data.weight,
          isActive: data.isActive,
        });
        success(`Member "${data.name}" added successfully`);
      }
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save member";
      error(errorMessage);
      logError(err, {
        context: "AddMemberModal",
        action: member ? "update" : "create",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="add-member-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}} // Controlled by parent
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {member ? "Edit Member" : "Add Member"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Name *"
                {...register("name")}
                error={errors.name?.message}
                placeholder="Enter member name"
                autoFocus
              />

              <Input
                label="Emoji"
                {...register("emoji")}
                error={errors.emoji?.message}
                placeholder="👨 (optional)"
                maxLength={2}
              />

              <Input
                label="Weight *"
                type="number"
                step="0.1"
                min="0.1"
                {...register("weight", { valueAsNumber: true })}
                error={errors.weight?.message}
                placeholder="1.0"
              />
              <p className="text-xs text-base-content/60">
                Weight determines share (1.0 = normal, 1.5 = 50% more, 0.5 = 50%
                less)
              </p>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    {...register("isActive")}
                  />
                  <span className="label-text">Active member</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {member ? "Update" : "Add"} Member
              </Button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}
