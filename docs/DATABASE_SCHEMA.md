# Database Schema Documentation

## Overview

This document describes the SQLite database schema for **LockedIn**, including table structures, relationships, indexes, and migration strategy from the legacy schema to the current architecture.

**Database Engine:** SQLite 3.43+
**ORM:** Drizzle ORM
**Location:** Local device storage (`lockedin.db`)
**Version:** 1.0

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Table Definitions](#table-definitions)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Query Patterns](#query-patterns)
6. [Data Integrity Rules](#data-integrity-rules)

---

## 1. Schema Overview

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        goals                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ id (TEXT PK)                                     │   │
│  │ title (TEXT NOT NULL)                            │   │
│  │ description (TEXT)                               │   │
│  │ targetHours (REAL NOT NULL)                      │   │
│  │ hoursLogged (REAL DEFAULT 0)                     │   │
│  │ deadline (INTEGER timestamp)                     │   │
│  │ createdAt (INTEGER timestamp)                    │   │
│  │ color (TEXT)                                     │   │
│  │ status (TEXT)                                    │   │
│  │ efficiency (REAL)                                │   │
│  └──────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────┴─────────┬──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────────┐  ┌──────────────┐  ┌────────────────┐
│ milestones  │  │focus_sessions│  │                │
├─────────────┤  ├──────────────┤  │                │
│ id (PK)     │  │ id (PK)      │  │                │
│ goalId (FK) │  │ goalId (FK)  │  │                │
│ title       │  │ startTime    │  │                │
│ completed   │  │ endTime      │  │                │
│ completedAt │  │ duration     │  │                │
│ orderIndex  │  │ status       │  │                │
└─────────────┘  │ notes        │  │                │
                 └──────────────┘  │                │
                                   │                │
                              ┌────▼──────────┐     │
                              │daily_progress │     │
                              ├───────────────┤     │
                              │ id (PK)       │     │
                              │ date          │     │
                              │ totalMinutes  │     │
                              │ goalsWorkedOn │     │
                              │ streakCount   │     │
                              └───────────────┘     │
                                                    │
                                            ┌───────▼────────┐
                                            │ chat_messages  │
                                            ├────────────────┤
                                            │ id (PK)        │
                                            │ role           │
                                            │ content        │
                                            │ createdAt      │
                                            │ contextSnapshot│
                                            └────────────────┘
```

---

## 2. Table Deinitions

### 2.1 `goals` Table

**Purpose:** Store user-defined short-term goals with progress tracking.

#### Drizzle Schema:

```typescript
// db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

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
```

#### SQL Representation

```sql
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  target_hours REAL NOT NULL,
  hours_logged REAL NOT NULL DEFAULT 0,
  deadline DATETIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  efficiency REAL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
);
```

#### Field Descriptions:

| Field         | Type    | Constraints      | Description                                                         |
| ------------- | ------- | ---------------- | ------------------------------------------------------------------- |
| `id`          | TEXT    | PRIMARY KEY      | UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)              |
| `title`       | TEXT    | NOT NULL, UNIQUE | Goal name (3-100 chars)                                             |
| `description` | TEXT    | NULL             | Optional details (max 500 chars)                                    |
| `targetHours` | REAL    | NOT NULL, > 0    | Total hours needed to complete goal                                 |
| `hoursLogged` | REAL    | NOT NULL, ≥ 0    | Cumulative hours worked (sum of focus sessions)                     |
| `deadline`    | INTEGER | NULL             | Unix timestamp (ms), calculated as `Date.now() + (days * 86400000)` |
| `createdAt`   | INTEGER | NOT NULL         | Unix timestamp when goal was created                                |
| `updatedAt`   | INTEGER | NULL             | Last modification timestamp                                         |
| `color`       | TEXT    | NOT NULL         | Hex color for UI theming (e.g., `#f59e0b`)                          |
| `status`      | TEXT    | NOT NULL         | Current state: `active`, `completed`, `archived`                    |
| `efficiency`  | REAL    | NULL             | Performance metric: `(hoursLogged / expectedHoursByNow) * 100`      |

#### Business Rules:

- `hoursLogged` cannot exceed `targetHours` which is enforced in app logic.
- When `hoursLogged >= targetHours`, status auto-updates to `completed`.
- `efficiency` is recalculated on every focus session completion.
- `deadline` is optional (NULL = no deadline)

---

### 2.2 `milestones` Table

**Purpose:** Break down goals into smaller, trackable checkpoints.

#### Drizzle Schema:

```typescript
export const milestones = sqliteTable("milestones", {
  id: text("id")
    .primaryKey()
    .$default(() => crypt.randomUUID()),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" })
    .notNull()
    .default("false"),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  orderIndex: integer("order_index").notNull(), // For drag-and-drop reordering
});
```

#### SQL Representation:

```sql
CREATE TABLE milestone (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at DATETIME,
  order_index INTEGER NOT NULL,

  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
);
```

#### Field Descriptions:

| Field         | Type    | Description                                       |
| ------------- | ------- | ------------------------------------------------- |
| `id`          | TEXT    | UUID                                              |
| `goalId`      | TEXT    | Foreign key to `goals.id`                         |
| `title`       | TEXT    | Milestone description (e.g., "Complete Module 3") |
| `completed`   | INTEGER | Boolean (0/1), cannot be uncompleted once marked  |
| `completedAt` | INTEGER | Timestamp when marked complete                    |
| `orderIndex`  | INTEGER | Display order (0-based, used for drag-and-drop)   |

#### Business Rules:

- Minimum 1 milestone per goal (enforced in UI).
- Maximum 20 milestones per goal (UX constraint).
- `completedAt` is null until milestone is marked done.
- Deleting a goal cascades to all its milestones.

---

### 2.3 `focus_sessions` Table

**Purpose:** Log time-tracking session for each goal.

#### Drizzle Schema

```typescript
export const focusSessions = sqliteTable("focus_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  goalId: text("id")
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
```

#### SQL Representation:

```sql
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes REAL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
  notes TEXT,

  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);
```

#### Field Descriptions:

| Field             | Type    | Description                                                         |
| ----------------- | ------- | ------------------------------------------------------------------- |
| `id`              | TEXT    | UUID                                                                |
| `goalId`          | TEXT    | Foreign key to `goals.id`                                           |
| `startTime`       | INTEGER | Unix timestamp when timer started                                   |
| `endTime`         | INTEGER | Unix timestamp when timer ended (NULL if active)                    |
| `durationMinutes` | REAL    | Calculated duration in minutes (25.5, 30.0, etc.)                   |
| `status`          | TEXT    | `active` (running), `completed` (finished), `cancelled` (discarded) |
| `notes`           | TEXT    | Optional post-session reflection                                    |

#### Business Rules:

- Only one session can have `status = active` at a time which is enforced in app.
- `endTime` and `durationMinutes` are null while session is active.
- When session completes, `hoursLogged` in `goals` updates `+= durationMinutes / 60`

---

### 2.4 `daily_progress` Table

**Purpose:** Pre-aggregated daily statistics for fast analytics queries.

```typescript
export const dailyProgress = sqliteTable("daily_progress", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  streakCount: integer("streak_count").notNull().default(1),
  totalMinutes: real("total_minutes").notNull().default(0),
  goalsWorkedOn: integer("goals_worked_on").notNull().default(0),
});
```

#### SQL Representation:

```sql
CREATE TABLE daily_progress (
  id TEXT PRIMARY KEY,
  date DATETIME NOT NULL UNIQUE, -- e.g., '2026-01-23'
  streak_count INTEGER NOT NULL DEFAULT 1
  total_minutes REAL NOT NULL DEFAULT 0,
  goals_worked_on INTEGER NOT NULL DEFAULT 0,
);
```

#### Update Logic:

```typescript
// When focus session completes
await db.transaction(async (tx) => {
  await tx.insert(focusSessions).values(sessionData);

  await tx.insert(dailyProgress).values({
    date: format(new Date(), "yyyy-MM-dd"),
    totalMinutes: sessionData.durationMinutes,
    goalsWorkedOn: 1,
  });
  onConflictDoUpdate({
    target: dailyProgress.date,
    set: {
      totalMinutes: sql`${dailyProgress.totalMinutes} + ${sessionData.durationMinutes}`,
      goalsWorkedOn: sql`${dailyProgress.goalsWorkedOn} + 1`,
    },
  });
});
```

#### Business Rules:

- One row per calendar day.
- `totalMinutes` is cumulative for that day.
- `goalsWorkedOn` counts unique goals incrementally, may have duplicates but acceptable.
- `streakCount` updates at midnight by a separate cron or scheduled task.

---

### 2.5 `chat_messages` Table

**Purpose:** Persis AI conversation history for context and user preferences.

#### Drizzle Schema:

```typescript
export const chatMessage = sqliteTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  role: text("role", { enum: ["user", "assistnat"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  contextSnapshot: text("context_snapshot"), // JSON: {goals: [...], stats: [...]}
});
```

#### SQL Representation:

```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  context_snapshot TEXT -- JSON blob
);
```

#### Field Descriptions:

| Field             | Type    | Description                                               |
| ----------------- | ------- | --------------------------------------------------------- |
| `id`              | TEXT    | UUID                                                      |
| `role`            | TEXT    | `user` (human message) or `assistant` (AI response)       |
| `content`         | TEXT    | Message text (max 2000 chars for user, unlimited for AI)  |
| `createdAt`       | INTEGER | Timestamp                                                 |
| `contextSnapshot` | TEXT    | JSON snapshot of goals at time of message (for debugging) |

#### Business Rules:

- Keep last 50 messages.
- Messages alternate: user -> assistant -> user -> assistant.
- `contextSnapshot` only stored for user messages not AI responses.

---

## 3. Relationships

### Foreign Key Constraints

```sql
-- Milestones belong to Goals (1:N)
ALTER TABLE milestones
ADD CONSTRAINT fk_milestones_goal
FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE;

-- Focus Sessions belong to Goals (1:N)
ALTER TABLE focus_sessions
ADD CONSTRAINT fk_sessions_goal
FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE;
```

### Cascade Behavior

```
DELETE FROM goals WHERE id = 'abc-123';
    ↓
Automatically deletes:
  - All milestones with goal_id = 'abc-123'
  - All focus_sessions with goal_id = 'abc-123'
    ↓
Does NOT delete:
  - daily_progress (aggregated data persists)
  - chat_messages (conversation history preserved)
```

---

## 4. Indexes

### 4.1 Primary Indexes (Auto-Created)

```sql
-- All primary keys automatically indexed
CREATE UNIQUE INDEX idx_goals_id ON goals(id);
CREATE UNIQUE INDEX idx_milestones_id ON milestones(id);
CREATE UNIQUE INDEX idx_focus_sessions_id ON focus_sessions(id);
CREATE UNIQUE INDEX idx_daily_progress_id ON daily_progress(id);
CREATE UNIQUE INDEX idx_chat_messages_id ON chat_messages(id);
```

### 4.2 Performance Indexes (Manual)

```sql
-- Speed up focus session queries by date (analytics)
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time DESC);

-- Find active sessiosn (timer recovery on app restart)
CREATE INDEX idx_focus_sessions_status ON focus_sessions(status) WHERE status = 'active';

-- Daily progress lookups
CREATE UNIQUE INDEX idx_daily_progress_date ON daily_progress(date);

-- Goal-specific milestone queries
CREATE INDEX idx_milestones_goal_order
ON milestones(goal_id, order_index);

-- Chat history pagination
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

### 4.3 Index Rationale

| Index                           | Query Benefit                      | Trade-off                        |
| ------------------------------- | ---------------------------------- | -------------------------------- |
| `idx_focus_sessions_start_time` | "Last 30 days sessions" 10x faster | +5% write overhead               |
| `idx_focus_sessions_status`     | Timer recovery <10ms               | Partial index (minimal overhead) |
| `idx_milestones_goal_order`     | Milestone list loads instantly     | +10% write overhead              |
| `idx_chat_messages_created_at`  | Chat history pagination fast       | +5% write overhead               |

**Total overhead:** ~15% slower writes, but 10-50x faster reads which is worth it.

---

## 5. Query Patterns

### 5.1 Common Queries

#### Get ALL Active Goals with Progress

```typescript
const goals = await db
  .select()
  .from(goals)
  .where(eq(goals.status, "active"))
  .orderBy(desc(goals.createdAt));

// Uses PK index
```

#### Get Goal with Milestones (JOIN)

```typescript
const goalWithMilestones = await db
  .select({
    goal: goals,
    milestones: milestones
  })
  .from(goals)
  .leftJoin(milestones, eq(milestones.goalId, goals.id))
  .where(eq(goals.id, goalId));

// Uses idx_milestones_goal_order
```

#### Get Last 30 Days Focus Sessions

```typescript
const recentSessions = await db
  .select()
  .from(focusSessions)
  .where(gt(focusSessions.startTime, thirtyDaysAgo))
  .orderBy(desc(focusSessions.startTime));

// Uses idx_focus_sessions_start_time
```

#### Get Today's Progress

```typescript
const today = format(new Date(), "yyyy-MM-dd");

const todayProgress = await db
  .select()
  .from(dailyProgress)
  .where(eq(dailyProgress.date, today))
  .get();

// Uses idx_daily_progress_date unique index
```

### 5.2 Complex Queries (Analytics)

#### Calculate Current Streak

```typescript

```