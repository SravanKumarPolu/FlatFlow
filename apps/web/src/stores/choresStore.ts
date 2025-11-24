import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chore, ChoreCompletion } from "@flatflow/core";

interface ChoresState {
  chores: Chore[];
  completions: ChoreCompletion[];
  addChore: (chore: Omit<Chore, "id" | "createdAt" | "updatedAt">) => void;
  updateChore: (id: string, updates: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  getChore: (id: string) => Chore | undefined;
  getChoresByFlatId: (flatId: string) => Chore[];
  getActiveChoresByFlatId: (flatId: string) => Chore[];
  rotateChore: (choreId: string) => Chore | undefined;
  completeChore: (choreId: string, memberId: string, note?: string) => void;
  getCompletionsByChoreId: (choreId: string) => ChoreCompletion[];
  getCompletionsByFlatId: (flatId: string) => ChoreCompletion[];
  resetChores: () => void;
}

const generateId = () => `chore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateCompletionId = () => `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChoresStore = create<ChoresState>()(
  persist(
    (set, get) => ({
      chores: [],
      completions: [],

      addChore: (choreData) => {
        const now = new Date().toISOString();
        const newChore: Chore = {
          ...choreData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          chores: [...state.chores, newChore],
        }));
      },

      updateChore: (id, updates) => {
        set((state) => ({
          chores: state.chores.map((chore) =>
            chore.id === id
              ? { ...chore, ...updates, updatedAt: new Date().toISOString() }
              : chore
          ),
        }));
      },

      deleteChore: (id) => {
        set((state) => ({
          chores: state.chores.filter((chore) => chore.id !== id),
          completions: state.completions.filter((c) => c.choreId !== id),
        }));
      },

      getChore: (id) => {
        return get().chores.find((chore) => chore.id === id);
      },

      getChoresByFlatId: (flatId) => {
        return get()
          .chores.filter((chore) => chore.flatId === flatId)
          .sort((a, b) => a.name.localeCompare(b.name));
      },

      getActiveChoresByFlatId: (flatId) => {
        return get()
          .chores.filter((chore) => chore.flatId === flatId && chore.isActive)
          .sort((a, b) => a.name.localeCompare(b.name));
      },

      rotateChore: (choreId) => {
        const chore = get().getChore(choreId);
        if (!chore || chore.rotationOrder.length === 0) return undefined;

        const currentIndex = chore.rotationOrder.indexOf(chore.currentAssigneeId);
        const nextIndex = (currentIndex + 1) % chore.rotationOrder.length;
        const nextAssigneeId = chore.rotationOrder[nextIndex];

        get().updateChore(choreId, {
          currentAssigneeId: nextAssigneeId,
        });

        return get().getChore(choreId);
      },

      completeChore: (choreId, memberId, note) => {
        const chore = get().getChore(choreId);
        if (!chore) return;

        const now = new Date().toISOString();
        const completion: ChoreCompletion = {
          id: generateCompletionId(),
          choreId,
          flatId: chore.flatId,
          completedByMemberId: memberId,
          completedAt: now,
          note,
          createdAt: now,
        };

        set((state) => ({
          completions: [...state.completions, completion],
        }));

        // Update chore with completion info
        get().updateChore(choreId, {
          lastCompletedAt: now,
          lastCompletedBy: memberId,
        });

        // Auto-rotate if needed (rotate after completion)
        get().rotateChore(choreId);
      },

      getCompletionsByChoreId: (choreId) => {
        return get()
          .completions.filter((c) => c.choreId === choreId)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      },

      getCompletionsByFlatId: (flatId) => {
        return get()
          .completions.filter((c) => c.flatId === flatId)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      },

      resetChores: () => {
        set({ chores: [], completions: [] });
      },
    }),
    {
      name: "flatflow-chores-storage",
    }
  )
);

