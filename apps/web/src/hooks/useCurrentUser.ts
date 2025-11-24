import { useUserStore } from "../stores/userStore";
import { useMembers } from "./useMembers";

/**
 * Hook for managing the current user (which member is "you")
 * Provides access to current user member ID and helper methods
 */
export function useCurrentUser() {
  const currentMemberId = useUserStore((state) => state.currentMemberId);
  const setCurrentMemberId = useUserStore((state) => state.setCurrentMemberId);
  const clearCurrentMemberId = useUserStore((state) => state.clearCurrentMemberId);
  const { members, getMember } = useMembers();

  // Get current user member ID with fallback
  const getCurrentMemberId = () => {
    if (currentMemberId) {
      // Verify the member still exists
      const member = getMember(currentMemberId);
      if (member) return currentMemberId;
    }
    // Fallback to first active member if no current user set
    const firstActiveMember = members.find((m) => m.isActive);
    return firstActiveMember?.id || null;
  };

  // Get current user member object
  const getCurrentMember = () => {
    const id = getCurrentMemberId();
    return id ? getMember(id) : null;
  };

  return {
    currentMemberId: getCurrentMemberId(),
    currentMember: getCurrentMember(),
    setCurrentMemberId,
    clearCurrentMemberId,
  };
}

