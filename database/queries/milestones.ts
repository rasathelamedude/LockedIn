import { eq } from "drizzle-orm";
import { db } from "../client";
import { milestones } from "../schema";

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export const getMilestonesForGoal = async (
  goalId: string,
): Promise<Milestone[]> => {
  const goalMilestones = await db
    .select()
    .from(milestones)
    .where(eq(milestones.goalId, goalId));

  return goalMilestones;
};

export const createMilestone = async ()
