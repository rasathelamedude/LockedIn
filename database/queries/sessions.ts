import { eq } from "drizzle-orm";
import { db } from "../client";
import { focusSessions } from "../schema";
import { recalculateEfficiency, updateHoursLogged } from "./goals";

export type Session = typeof focusSessions.$inferSelect;
export type NewSession = typeof focusSessions.$inferInsert;

export const getActiveSessions = async (): Promise<Session[]> => {
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.status, "active"));

  return sessions;
};

export const startSession = async (goalId: string): Promise<Session> => {
  const [newSession] = await db
    .insert(focusSessions)
    .values({
      goalId,
      startTime: new Date(),
    })
    .returning();

  return newSession;
};

export const completeSession = async (
  sessionId: string,
  notes?: string,
): Promise<void> => {
  const endTime = new Date();

  const session = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.id, sessionId))
    .get();

  if (!session) {
    throw new Error("Session not found.");
  }

  const durationMinutes = Math.round(
    (endTime.getTime() - new Date(session.startTime).getTime()) / 60000,
  );

  // 1. Update the session
  await db
    .update(focusSessions)
    .set({ endTime, durationMinutes, status: "completed", notes })
    .where(eq(focusSessions.id, sessionId));

  // 2. Update the associated goal's hours logged and efficiency
  const hoursToAdd = durationMinutes / 60;
  await updateHoursLogged(session.goalId, hoursToAdd);

  // 3. Recalculate the goal's efficiency
  await recalculateEfficiency(session.goalId);
};

export const getSessionsByGoal = async (goalId: string): Promise<Session[]> => {
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.goalId, goalId));

  return sessions;
};
