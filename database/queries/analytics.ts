import { desc, eq, sql, sum } from "drizzle-orm";
import { db } from "../client";
import { dailyProgress, focusSessions } from "../schema";

export type DailyProgress = typeof dailyProgress.$inferSelect;

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

// Get total focus hours for today;
export const getTodayFocusHours = async (): Promise<number> => {
  // Get today's date
  const today = getTodayDateString();

  // SQLite stores timestamps as integers (milliseconds)
  // Get start and end of today in milliseconds
  const startOfDay = new Date(today).setHours(0, 0, 0, 0);
  const endOfDay = new Date(today).setHours(23, 59, 59, 999);

  // Get total focus hours for today
  const result = await db
    .select({
      totalMinutes: sum(focusSessions.durationMinutes),
    })
    .from(focusSessions)
    .where(
      sql`${focusSessions.startTime} >= ${startOfDay} AND ${focusSessions.startTime} <= ${endOfDay}`,
    )
    .get();

  // Convert minutes to hours
  const totalHours = Number(result?.totalMinutes || 0) / 60;
  return totalHours || 0;
};

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
  const startOfDay = new Date(today).setHours(0, 0, 0, 0);
  const endOfDay = new Date(today).setHours(23, 59, 59, 999);

  const uniqueGoals = await db
    .selectDistinct({ goalId: focusSessions.goalId })
    .from(focusSessions)
    .where(
      sql`${focusSessions.startTime} >= ${startOfDay} AND ${focusSessions.startTime} <= ${endOfDay}`,
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
    : 0;

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
export const getStreakCount = async (): Promise<number> => {
  const allProgress = await db
    .select()
    .from(dailyProgress)
    .orderBy(desc(dailyProgress.date))
    .all();

  if (allProgress.length === 0) return 0;

  const today = getTodayDateString();
  const currentDate = new Date(today);
  let streak = 0;

  for (const progress of allProgress) {
    const progressDate = progress.date;
    const expectedDate = currentDate.toISOString().split("T")[0];

    // If this date doesn't match the expected date, break streak
    if (progressDate !== expectedDate) break;

    // If no minutes logged on this date, break streak
    if (progress.totalMinutes === 0) break;

    streak++;

    // Move to previous date
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

//
export const getWeeklyStats = async (): Promise<{
  totalHours: number;
  avgPerDay: number;
  mostProductiveDay: string;
}> => {
  const today = getTodayDateString();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoTimestamp = sevenDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await db
    .select()
    .from(focusSessions)
    .where(sql`${focusSessions.startTime} >= ${sevenDaysAgoTimestamp}`)
    .all();

  if (sessions.length === 0) {
    return {
      totalHours: 0,
      avgPerDay: 0,
      mostProductiveDay: "None",
    };
  }

  // Calculate total hours
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0,
  );
  const totalHours = totalMinutes / 60;

  // Calculate average per day (totalHours / 7)
  const avgPerDay = totalHours / 7;

  // Find most productive day
  const dayTotals: Record<string, number> = {};

  sessions.forEach((session) => {
    const dateString = new Date(session.startTime).toISOString().split("T")[0];
    dayTotals[dateString] =
      (dayTotals[dateString] || 0) + (session.durationMinutes || 0);
  });

  let mostProductiveDay = "None";
  let maxMinutes = 0;

  Object.entries(dayTotals).forEach(([date, minutes]) => {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      mostProductiveDay = date;
    }
  });

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    avgPerDay: Math.round(avgPerDay * 100) / 100,
    mostProductiveDay,
  };
};
