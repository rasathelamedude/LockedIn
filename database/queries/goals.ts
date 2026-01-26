import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { goals } from "../schema";

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

async function getGoalByTitle(title: string): Promise<Goal | null> {
  const goal = await db
    .select()
    .from(goals)
    .where(eq(goals.title, title))
    .get();

  return goal || null;
}

export const getAllGoals = async (): Promise<Goal[]> => {
  const userGoals = await db
    .select()
    .from(goals)
    .orderBy(desc(goals.createdAt));

  return userGoals;
};

export const getAllActiveGoals = async (): Promise<Goal[]> => {
  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.status, "active"))
    .orderBy(desc(goals.createdAt));

  return userGoals;
};

export const getGoalById = async (id: string): Promise<Goal | null> => {
  const goal = await db.select().from(goals).where(eq(goals.id, id)).get();

  return goal || null;
};

export const createGoal = async (data: NewGoal): Promise<Goal> => {
  const existingGoal = await getGoalByTitle(data.title);

  if (existingGoal) {
    throw new Error("A goal with this title already exists.");
  }

  const [newGoal] = await db.insert(goals).values(data).returning();

  return newGoal;
};

export const updateGoal = async (
  id: string,
  data: Partial<Goal>,
): Promise<void> => {
  await db.update(goals).set(data).where(eq(goals.id, id));
};

export const deleteGoal = async (id: string): Promise<void> => {
  await db.delete(goals).where(eq(goals.id, id));
};

export const updateHoursLogged = async (
  id: string,
  hours: number,
): Promise<void> => {
  const goal = await getGoalById(id);

  if (!goal) {
    throw new Error("Goal not found.");
  }

  await db
    .update(goals)
    .set({ hoursLogged: goal.hoursLogged + hours })
    .where(eq(goals.id, id));
};

export const recalculateEfficiency = async (id: string): Promise<void> => {
  const goal = await getGoalById(id);

  if (!goal) {
    throw new Error("Goal not found.");
  }

  let efficiency = goal.efficiency;

  if (!goal.deadline) {
    efficiency = (goal.hoursLogged / goal.targetHours) * 100;
  } else {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const created = new Date(goal.createdAt);

    const totalDuration = deadline.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();

    const expectedHours = Math.max(
      (goal.targetHours * elapsedTime) / totalDuration,
      1,
    );

    efficiency = (goal.hoursLogged / expectedHours) * 100;
  }

  await db.update(goals).set({ efficiency }).where(eq(goals.id, goal.id));
};
