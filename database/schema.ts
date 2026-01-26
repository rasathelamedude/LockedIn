import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const goals = sqliteTable("goals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull().unique(),
  description: text("description"),
  targetHours: real("target_hours").notNull(),
  hoursLogged: real("hours_logged").notNull().default(0),
  deadline: integer("deadline", { mode: "timestamp" }),
  status: text("status", { enum: ["active", "completed", "archived"] })
    .notNull()
    .default("active"),
  color: text("color").notNull().default("#3b82f6"),
  efficiency: real("efficiency"), // pre-calculated
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const milestones = sqliteTable("milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  orderIndex: integer("order_index").notNull(), // For drag-and-drop reordering
});

export const focusSessions = sqliteTable("focus_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  durationMinutes: real("duration_minutes"),
  status: text("status", { enum: ["active", "completed", "cancelled"] })
    .notNull()
    .default("active"),
  notes: text("notes"),
});

export const dailyProgress = sqliteTable("daily_progress", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  streakCount: integer("streak_count").notNull().default(1),
  totalMinutes: real("total_minutes").notNull().default(0),
  goalsWorkedOn: integer("goals_worked_on").notNull().default(0),
});

export const chatMessage = sqliteTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  contextSnapshot: text("context_snapshot"), // JSON: {goals: [...], stats: [...]}
});
