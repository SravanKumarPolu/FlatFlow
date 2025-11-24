import { useChoresStore } from "../stores/choresStore";
import { Chore, ChoreCompletion } from "@flatflow/core";

export function useChores() {
  const store = useChoresStore();

  return {
    chores: store.chores,
    completions: store.completions,
    addChore: store.addChore,
    updateChore: store.updateChore,
    deleteChore: store.deleteChore,
    getChore: store.getChore,
    getChoresByFlatId: store.getChoresByFlatId,
    getActiveChoresByFlatId: store.getActiveChoresByFlatId,
    rotateChore: store.rotateChore,
    completeChore: store.completeChore,
    getCompletionsByChoreId: store.getCompletionsByChoreId,
    getCompletionsByFlatId: store.getCompletionsByFlatId,
    resetChores: store.resetChores,
  };
}

