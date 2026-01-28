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

export const createMilestone = async (
  data: NewMilestone,
): Promise<Milestone> => {
  const [milestone] = await db.insert(milestones).values(data).returning();

  return milestone;
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  await db.delete(milestones).where(eq(milestones.id, milestoneId));
};

export const updateMilestone = async (
  milestoneId: string,
  data: Partial<Milestone>,
): Promise<void> => {
  await db.update(milestones).set(data).where(eq(milestones.id, milestoneId));
};

export const updateMilestoneOrder = async (
  milestoneId: string,
  newOrderIndex: number,
): Promise<void> => {
  await db
    .update(milestones)
    .set({ orderIndex: newOrderIndex })
    .where(eq(milestones.id, milestoneId));
};

export const toggleMilestoneCompletion = async (
  milestoneId: string,
  completed: boolean,
): Promise<void> => {
  const milestone = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .get();

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  if (milestone.completed) {
    throw new Error("Milestone is already completed");
  }

  await db
    .update(milestones)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(milestones.id, milestoneId));
};
