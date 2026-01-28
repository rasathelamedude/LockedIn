import {
  Milestone,
  getMilestonesForGoal,
  toggleMilestoneCompletion,
} from "@/database/queries/milestones";
import { create } from "zustand";

interface MilestoneStore {
  milestones: Milestone[];
  loading: boolean;

  getMilestonesWithGoalId: (goalId: string) => Promise<void>;
  toggleMilestone: (milestoneId: string) => Promise<void>;
}

export const useMilestoneStore = create<MilestoneStore>((set, get) => ({
  milestones: [] as Milestone[],
  loading: false,

  getMilestonesWithGoalId: async (goalId: string) => {
    set({ loading: true });

    try {
      const milestones = await getMilestonesForGoal(goalId);
      set({ milestones, loading: false });
    } catch (error) {
      console.error("Error fetching milestones: ", error);
      set({ loading: false });
    }
  },

  toggleMilestone: async (milestoneId: string) => {
    set({ loading: true });

    try {
      await toggleMilestoneCompletion(milestoneId);
      const { milestones } = get();
      set({
        milestones: milestones.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, completed: true, completedAt: new Date() }
            : milestone,
        ),
        loading: false,
      });
    } catch (error) {
      console.error(`Error toggling milestone: ${error}`);
      set({ loading: false });
      throw error;
    }
  },
}));
