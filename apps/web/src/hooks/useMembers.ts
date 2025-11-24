import { useMembersStore } from "../stores/membersStore";
import { Member } from "@flatflow/core";

/**
 * Hook for managing members data
 * Provides access to members state and CRUD operations
 */
export function useMembers() {
  const members = useMembersStore((state) => state.members);
  const addMember = useMembersStore((state) => state.addMember);
  const updateMember = useMembersStore((state) => state.updateMember);
  const deleteMember = useMembersStore((state) => state.deleteMember);
  const getMember = useMembersStore((state) => state.getMember);
  const getActiveMembers = useMembersStore((state) => state.getActiveMembers);

  return {
    members,
    addMember,
    updateMember,
    deleteMember,
    getMember,
    getActiveMembers,
  };
}

