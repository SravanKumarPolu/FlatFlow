import { useState, useMemo } from "react";
import {
  PageHeader,
  AddMemberModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Member } from "@flatflow/core";
import { useMembers, useCurrentUser, useToast, useFlat } from "../../hooks";

export default function MembersPage() {
  const { members, deleteMember } = useMembers();
  const { currentMemberId, setCurrentMemberId } = useCurrentUser();
  const { success, error } = useToast();
  const { getCurrentFlatId } = useFlat();
  const currentFlatId = getCurrentFlatId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    member: Member | null;
  }>({ isOpen: false, member: null });

  // Filter members for current flat
  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  return (
    <>
      <PageHeader
        title="Members"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingMember(null);
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
            Add Member
          </Button>
        }
      />

      {flatMembers.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">👥</span>}
              title="No members yet"
              description="Add your first flatmate to start tracking expenses together."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingMember(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Member
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Emoji</th>
                    <th>Status</th>
                    <th>Weight</th>
                    <th>You</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flatMembers.map((member) => (
                    <tr key={member.id} className="hover">
                      <td>
                        <div className="font-semibold">{member.name}</div>
                      </td>
                      <td>
                        <span className="text-2xl">{member.emoji || "👤"}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            member.isActive ? "badge-success" : "badge-neutral"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{member.weight}x</td>
                      <td>
                        <input
                          type="radio"
                          name="current-user"
                          className="radio radio-primary"
                          checked={currentMemberId === member.id}
                          onChange={() => setCurrentMemberId(member.id)}
                        />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMember(member);
                              setIsModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteConfirm({ isOpen: true, member });
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, member: null })}
        onConfirm={() => {
          if (deleteConfirm.member) {
            try {
              deleteMember(deleteConfirm.member.id);
              success(
                `Member "${deleteConfirm.member.name}" deleted successfully`
              );
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : "Failed to delete member";
              error(errorMessage);
            }
          }
        }}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteConfirm.member?.name}?`}
        itemName={deleteConfirm.member?.name}
      />
    </>
  );
}
