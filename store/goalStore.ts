import {
  Goal,
  createGoal,
  deleteGoal,
  getAllActiveGoals,
  getGoalById,
  updateGoal,
} from "@/database/queries/goals";
import { create } from "zustand";

export const useGoalStore = create((set, get) => ({
  goals: [] as Goal[],
  loading: false,

  setGoals: (goals: Goal[]) => set({ goals }),
  setLoading: (loading: boolean) => set({ loading }),

  getGoals: async () => {
    set({ loading: true });
    const goals = await getAllActiveGoals();
    set({ goals, loading: false });
  },

  getGoal: async (goalId: string) => {
    set({ loading: true });
    const goal = await getGoalById(goalId);
    set({ loading: false });
    return goal;
  },

  refreshGoals: async () => {
    set({ loading: true });
    const goals = await getAllActiveGoals();
    set({ goals, loading: false });
  },

  addGoal: (goal: Goal) => {
    set({ loading: true });
    const newGoal = createGoal(goal);
    set((state: any) => ({ goals: [newGoal, ...state.goals] }));
  },

  removeGoal: (goalId: string) => {
    set({ loading: true });
    deleteGoal(goalId);
    set((state: any) => ({
      goals: state.goals.filter((goal: Goal) => goal.id !== goalId),
      loading: false,
    }));
  },

  editGoal: (goalId: string, data: Partial<Goal>) => {
    set({ loading: true });
    updateGoal(goalId, data);
    set((state: any) => ({
      goals: state.goals.map((goal: Goal) =>
        goal.id === goalId ? { ...goal, ...data } : goal,
      ),
      loading: false,
    }));
  },
}));
