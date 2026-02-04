import { openDatabaseSync } from "expo-sqlite";

export async function runMigrations() {
  const db = openDatabaseSync("lockedin.db");

  try {
    console.log("Starting database migrations...");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        description TEXT,
        target_hours REAL NOT NULL,
        hours_logged REAL NOT NULL DEFAULT 0,
        deadline INTEGER,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
        color TEXT NOT NULL DEFAULT '#3b82f6',
        efficiency REAL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at INTEGER,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        duration_minutes REAL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        notes TEXT,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS daily_progress (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        total_minutes REAL NOT NULL DEFAULT 0,
        goals_worked_on INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        context_snapshot TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_focus_sessions_start_time ON focus_sessions(start_time DESC);
      CREATE INDEX IF NOT EXISTS idx_focus_sessions_status ON focus_sessions(status) WHERE status = 'active';
      CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON daily_progress(date);
      CREATE INDEX IF NOT EXISTS idx_milestones_goal_order ON milestones(goal_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
    `);

    console.log("Database migrations completed successfully.");
  } catch (error) {
    console.error("Error running migrations:", error);
  }
}
