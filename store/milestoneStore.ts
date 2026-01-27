import { Milestone, getMilestonesForGoal } from "@/database/queries/milestones";
import { create } from "zustand";

interface MilestoneStore {
  milestones: Milestone[];
  loading: boolean;

  getMilestonesWithGoalId: (goalId: string) => Promise<void>;
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
}));
