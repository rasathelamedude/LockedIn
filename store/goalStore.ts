import {
  Goal,
  NewGoal,
  createGoal,
  deleteGoal,
  getAllActiveGoals,
  getGoalById,
  updateGoal,
} from "@/database/queries/goals";
import { create } from "zustand";

interface GoalStore {
  goals: Goal[];
  loading: boolean;
  error: string | null;

  loadGoals: () => Promise<void>;
  getGoalWithId: (goalId: string) => Promise<Goal | null>;
  refreshGoals: () => Promise<void>;
  addGoal: (goal: NewGoal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  editGoal: (goalId: string, data: Partial<Goal>) => Promise<void>;
  clearError: () => void;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [] as Goal[],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  loadGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await getAllActiveGoals();
      set({ goals, loading: false });
    } catch (error) {
      console.error("Error occured while loading goals");
      set({ error: (error as Error).message, loading: false });
    }
  },

  getGoalWithId: async (goalId: string): Promise<Goal | null> => {
    set({ loading: true, error: null });

    try {
      const goal = await getGoalById(goalId);
      set({ loading: false });
      return goal;
    } catch (error) {
      console.error(`Error occured while fetching goal with id: ${goalId}`);
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  refreshGoals: async (): Promise<void> => {
    const { loadGoals } = get();
    await loadGoals();
  },

  addGoal: async (goal: NewGoal): Promise<void> => {
    set({ loading: true });

    try {
      const newGoal = await createGoal(goal);
      set((state: { goals: Goal[]; loading: boolean }) => ({
        goals: [newGoal, ...state.goals],
        loading: false,
      }));
    } catch (error) {
      console.error(`Error occured while creating a new goal`);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    set({ loading: true, error: null });

    try {
      await deleteGoal(goalId);
      set((state: { goals: Goal[]; loading: boolean }) => ({
        goals: state.goals.filter((goal: Goal) => goal.id !== goalId),
        loading: false,
      }));
    } catch (error) {
      console.error(`Error occured while removing goal with id: ${goalId}`);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  editGoal: async (goalId: string, data: Partial<Goal>) => {
    set({ loading: true, error: null });

    try {
      await updateGoal(goalId, data);
      set((state: { goals: Goal[]; loading: boolean }) => ({
        goals: state.goals.map((goal: Goal) =>
          goal.id === goalId ? { ...goal, ...data } : goal,
        ),
        loading: false,
      }));
    } catch (error) {
      console.error(`Error occured while updating goal with id: ${goalId}`);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
