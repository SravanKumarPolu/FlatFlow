import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Member } from "@flatflow/core";

interface MembersState {
  members: Member[];
  addMember: (member: Omit<Member, "id" | "createdAt" | "updatedAt">) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  getActiveMembers: () => Member[];
  resetMembers: () => void;
}

const generateId = () => `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useMembersStore = create<MembersState>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (memberData) => {
        const now = new Date().toISOString();
        const newMember: Member = {
          ...memberData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? { ...member, ...updates, updatedAt: new Date().toISOString() }
              : member
          ),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }));
      },

      getMember: (id) => {
        return get().members.find((member) => member.id === id);
      },

      getActiveMembers: () => {
        return get().members.filter((member) => member.isActive);
      },

      resetMembers: () => {
        set({ members: [] });
      },
    }),
    {
      name: "flatflow-members-storage",
    }
  )
);

