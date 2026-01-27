import { eq } from "drizzle-orm";
import { db } from "../client";
import { focusSessions } from "../schema";
import { recalculateEfficiency, updateHoursLogged } from "./goals";

export type Session = typeof focusSessions.$inferSelect;
export type NewSession = typeof focusSessions.$inferInsert;

// Get all active focus sessions
export const getActiveSessions = async (): Promise<Session[]> => {
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.status, "active"));

  return sessions;
};

// Get THE active session (singular)
export const getActiveSession = async (): Promise<Session | null> => {
  const session = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.status, "active"))
    .get();

  return session || null;
};

export const startSession = async (goalId: string): Promise<Session> => {
  const existingActiveSession = await getActiveSession();
  if (existingActiveSession) {
    throw new Error("An active session already exists.");
  }

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

  // Calculate duration of the focus session
  const durationMinutes = Math.round(
    (endTime.getTime() - new Date(session.startTime).getTime()) / 60000,
  );

  // 1. Update the session's end time, duration, status, and notes
  await db
    .update(focusSessions)
    .set({
      endTime,
      durationMinutes,
      status: "completed",
      notes,
    })
    .where(eq(focusSessions.id, sessionId));

  // 2. Update the associated goal's hours logged
  const hoursToAdd = durationMinutes / 60;
  await updateHoursLogged(session.goalId, hoursToAdd);

  // 3. Recalculate the goal's efficiency
  await recalculateEfficiency(session.goalId);
};

export const cancelSession = async (sessionId: string): Promise<void> => {
  const session = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.id, sessionId))
    .get();

  if (!session) {
    throw new Error("Session not found.");
  }

  await db
    .update(focusSessions)
    .set({ status: "cancelled", endTime: new Date() })
    .where(eq(focusSessions.id, sessionId));
};

export const getSessionsByGoal = async (goalId: string): Promise<Session[]> => {
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.goalId, goalId));

  return sessions;
};
