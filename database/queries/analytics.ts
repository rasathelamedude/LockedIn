import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../client";
import { dailyProgress, focusSessions } from "../schema";

export type DailyProgress = typeof dailyProgress.$inferSelect;

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Get total focus hours for today;
export async function getTodayFocusHours(): Promise<number> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  try {
    // Get all completed sessions from today
    const sessions = await db
      .select()
      .from(focusSessions)
      .where(
        and(
          gte(focusSessions.startTime, startOfDay),
          lte(focusSessions.startTime, endOfDay),
          eq(focusSessions.status, "completed"),
        ),
      );

    // Sum up duration in minutes
    const totalMinutes = sessions.reduce(
      (sum, session) => sum + (session.durationMinutes || 0),
      0,
    );

    // Convert minutes to hours with 1 decimal place
    const totalHours = totalMinutes / 60;

    return Number(totalHours.toFixed(1));
  } catch (error) {
    console.error("Error getting today's focus hours:", error);
    return 0;
  }
}

// Get today's progress record or create one if it doesn't exist
export const getTodayProgress = async (): Promise<DailyProgress> => {
  // Get today's date
  const today = getTodayDateString();

  // Get today's progress
  const progress = await db
    .select()
    .from(dailyProgress)
    .where(eq(dailyProgress.date, today))
    .get();

  // if found, return
  if (progress) return progress;

  // if not found, create one
  const [newProgress] = await db
    .insert(dailyProgress)
    .values({
      date: today,
      totalMinutes: 0,
      goalsWorkedOn: 0,
      streakCount: 0,
    })
    .returning();

  return newProgress;
};

// Update today's progress after completing a session
export const updateTodayProgress = async (
  goalId: string,
  sessionDurationMinutes: number,
): Promise<void> => {
  // Get today's progress
  const progress = await getTodayProgress();
  const today = getTodayDateString();

  // Calculate the new total minutes
  const newDuration = sessionDurationMinutes + progress.totalMinutes;

  // Get unique goals that was worked on today
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const uniqueGoals = await db
    .selectDistinct({ goalId: focusSessions.goalId })
    .from(focusSessions)
    .where(
      and(
        gte(focusSessions.startTime, startOfDay),
        lte(focusSessions.startTime, endOfDay),
      ),
    )
    .all();

  const newGoalsWorkedOn = uniqueGoals.length;

  // Calculate streak by checking if yesterday had progress
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split("T")[0];

  const yesterdayProgress = await db
    .select()
    .from(dailyProgress)
    .where(eq(dailyProgress.date, yesterdayString))
    .get();

  // If yesterday had progress then add 1 to streak count, otherwise set it to 0
  const newStreakCount = yesterdayProgress
    ? yesterdayProgress.streakCount + 1
    : 1;

  // Update
  await db
    .update(dailyProgress)
    .set({
      totalMinutes: newDuration,
      goalsWorkedOn: newGoalsWorkedOn,
      streakCount: newStreakCount,
    })
    .where(eq(dailyProgress.id, progress.id));
};

// Get streak count (consecutive days with sessions)
export async function getStreakCount(): Promise<number> {
  try {
    const allProgress = await db
      .select()
      .from(dailyProgress)
      .orderBy(desc(dailyProgress.date));

    if (allProgress.length === 0) return 0;

    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);

    for (let i = 0; i < allProgress.length; i++) {
      const progressDate = new Date(allProgress[i].date).setHours(0, 0, 0, 0);
      const expectedDate = today - streak * 86400000;

      if (progressDate === expectedDate && allProgress[i].totalMinutes > 0) {
        streak++;
      } else {
        break;
      }
    }

    return Math.max(streak, allProgress[0].totalMinutes > 0 ? 1 : 0);
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
}

export async function getWeeklyStats(): Promise<{
  totalHours: number;
  avgPerDay: number;
  mostProductiveDay: string;
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

  try {
    const sessions = await db
      .select()
      .from(focusSessions)
      .where(
        and(
          gte(focusSessions.startTime, new Date(sevenDaysAgo)),
          eq(focusSessions.status, "completed"),
        ),
      );

    if (sessions.length === 0) {
      return {
        totalHours: 0,
        avgPerDay: 0,
        mostProductiveDay: "None",
      };
    }

    // Calculate total minutes and convert to hours
    const totalMinutes = sessions.reduce(
      (sum, session) => sum + (session.durationMinutes || 0),
      0,
    );
    const totalHours = totalMinutes / 60;

    // Group by day to find most productive
    const dayMinutes: Record<string, number> = {};
    sessions.forEach((session) => {
      const date = new Date(session.startTime).toDateString();
      dayMinutes[date] =
        (dayMinutes[date] || 0) + (session.durationMinutes || 0);
    });

    const mostProductiveDay =
      Object.keys(dayMinutes).length > 0
        ? Object.entries(dayMinutes).sort((a, b) => b[1] - a[1])[0][0]
        : "None";

    return {
      totalHours: Number(totalHours.toFixed(1)),
      avgPerDay: Number((totalHours / 7).toFixed(1)),
      mostProductiveDay,
    };
  } catch (error) {
    console.error("Error getting weekly stats:", error);
    return {
      totalHours: 0,
      avgPerDay: 0,
      mostProductiveDay: "None",
    };
  }
}
