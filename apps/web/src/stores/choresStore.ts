import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chore, ChoreCompletion } from "@flatflow/core";
import { calculateNextDueDate, getNextAssignee } from "../lib/choreUtils";

/**
 * Migrate existing chores to include new required fields
 * This ensures backward compatibility with chores created before nextDueDate and rotationEnabled were added
 */
function migrateChores(chores: any[]): Chore[] {
  return chores.map((chore) => {
    // If chore is missing nextDueDate or rotationEnabled, add defaults
    if (!chore.nextDueDate || !chore.hasOwnProperty("rotationEnabled")) {
      const migratedChore: Chore = {
        ...chore,
        rotationEnabled: chore.rotationEnabled ?? true,
        nextDueDate:
          chore.nextDueDate ||
          calculateNextDueDate(
            chore.frequency || "WEEKLY",
            chore.lastCompletedAt ? new Date(chore.lastCompletedAt) : new Date()
          ),
      };
      return migratedChore;
    }
    return chore as Chore;
  });
}

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
        if (!chore || !chore.rotationEnabled || chore.rotationOrder.length < 2) {
          return undefined;
        }

        // Use pure helper function for rotation logic
        const nextAssigneeId = getNextAssignee(
          chore.currentAssigneeId,
          chore.rotationOrder
        );

        get().updateChore(choreId, {
          currentAssigneeId: nextAssigneeId,
        });

        return get().getChore(choreId);
      },

      completeChore: (choreId, memberId, note) => {
        const chore = get().getChore(choreId);
        if (!chore) return;

        const now = new Date();
        const nowISO = now.toISOString();
        
        // Create completion history entry
        const completion: ChoreCompletion = {
          id: generateCompletionId(),
          choreId,
          flatId: chore.flatId,
          completedByMemberId: memberId,
          completedAt: nowISO,
          note,
          createdAt: nowISO,
        };

        set((state) => ({
          completions: [...state.completions, completion],
        }));

        // Calculate next due date based on frequency
        const nextDueDate = calculateNextDueDate(chore.frequency, now);

        // Update chore with completion info and next due date
        const updates: Partial<Chore> = {
          lastCompletedAt: nowISO,
          lastCompletedBy: memberId,
          nextDueDate,
        };

        // Auto-rotate if rotation is enabled and there are multiple members
        if (chore.rotationEnabled && chore.rotationOrder.length > 1) {
          // Use pure helper function for rotation logic
          updates.currentAssigneeId = getNextAssignee(
            chore.currentAssigneeId,
            chore.rotationOrder
          );
        }

        get().updateChore(choreId, updates);
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
      // Migrate existing chores on rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.chores && state.chores.length > 0) {
          const migratedChores = migrateChores(state.chores);
          // Check if any migration occurred
          const needsMigration = migratedChores.some(
            (c, i) => c !== state.chores[i]
          );
          if (needsMigration) {
            state.chores = migratedChores;
          }
        }
      },
    }
  )
);

