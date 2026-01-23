# System Architecture

## Document Overview

This document describes the technical architecture of **LockedIn**, a cross-platform mobile application for goal tracking and AI-powered productivity optimization.

**Last Updated:** January 23rd 2026
**Version:** 1.0
**Author:** Rasyar Safin Mustafa

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Database Design](#database-design)
6. [State Management](#state-management)
7. [API Architecture](#api-architecture)
8. [Security Architecture](#security-architecture)
9. [Error Handling](#error-handling)
10. [Deployment Architecture](#deployment-architecture)
11. [Performance Considerations](#performance-considerations)
12. [Trade-offs & Constraints](#trade-offs--constraints)

---

## 1. High-Level Architecture

### System Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S MOBILE DEVICE                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Native App (Expo)                  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Presentation Layer                             │  │  │
│  │  │  - Screens (Goals, Timer, Chat, Analytics)      │  │  │
│  │  │  - Components (GoalCard, Timer, ChatBubble)     │  │  │
│  │  │  - Styling (NativeWind/Tailwind)                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                         ↕                             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic Layer                           │  │  │
│  │  │  - Custom Hooks (useGoals, useTimer, useChat)   │  │  │
│  │  │  - State Management (Zustand stores)            │  │  │
│  │  │  - Utility Functions (calculations, validators) │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                         ↕                             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Data Access Layer                              │  │  │
│  │  │  - Drizzle ORM (type-safe queries)              │  │  │
│  │  │  - API Client (fetch wrapper)                   │  │  │
│  │  │  - Cache Layer (query results)                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                         ↕                             │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Storage Layer                                  │  │  │
│  │  │  - SQLite Database (Expo SQLite)                │  │  │
│  │  │  - Secure Store (device ID)                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS (Online Only)
                             │ POST /api/chat
                             ↓
              ┌──────────────────────────────┐
              │   Vercel Edge Network        │
              │   (Global CDN)               │
              │                              │
              │  ┌────────────────────────┐  │
              │  │ Serverless Function    │  │
              │  │ /api/chat.ts           │  │
              │  │                        │  │
              │  │ - Rate Limiting        │  │
              │  │ - Input Validation     │  │
              │  │ - Context Building     │  │
              │  │ - Error Handling       │  │
              │  └────────────────────────┘  │
              └──────────────────────────────┘
                             │
                             │ HTTPS
                             │ POST /v1/messages
                             ↓
              ┌──────────────────────────────┐
              │   Anthropic API              │
              │   (Claude Sonnet 4)          │
              │                              │
              │   - Message Processing       │
              │   - Response Generation      │
              │   - Token Counting           │
              └──────────────────────────────┘
```

### Architecture Principles

1. **Offline-First:** All core functionalities works without internet connection.
2. **Loose Coupling:** Mobiel app and backend communicate via well-defined API, no shared state.
3. **Single Soure of Truth:** SQLite is the authoritative data source.
4. **Fail-Safe:** App degrades gracefully when backend/API is unavailable.
5. **Privacy-First:** No user accounts, all data local, no telemetry.

---

## 2. Technology Stack

### Frontend (Mobile Application)

| Technology             | Version | Purpose                  | Reason                                                |
| ---------------------- | ------- | ------------------------ | ----------------------------------------------------- |
| **React Native**       | 0.73+   | Cross-platform framework | Write once, deploy to iOS and Android                 |
| **Expo**               | SDK 50+ | Development framework    | Faster development, built-in modules, OTA updates     |
| **TypeScript**         | 5.3+    | Programming language     | Type safety, better IDE support, fewer runtime errors |
| **Expo Router**        | 3.0+    | Navigation               | File-based routing, simpler than React Navigation     |
| **Zustand**            | 4.5+    | State management         | Lightweight (1kb), simple API, no boilerplate         |
| **NativeWind**         | 4.0+    | Styling                  | Tailwind CSS for React Native, rapid UI development   |
| **Expo SQLite**        | 13.0+   | Local database           | Offline-first storage, zero configuration             |
| **Drizzle ORM**        | 0.29+   | Database ORM             | Type-safe queries, SQLite support, lightweight        |
| **date-fns**           | 3.0+    | Date manipulation        | Immutable, tree-shakeable, simple API                 |
| **@expo/vector-icons** | -       | Icon library             | Pre-bundled with Expo, 10,000+ icons                  |

### Backend (API Layer)

| Technology           | Version | Purpose            | Reason                                        |
| -------------------- | ------- | ------------------ | --------------------------------------------- |
| **Vercel Functions** | -       | Serverless runtime | Zero DevOps, auto-scaling, generous free tier |
| **Node.js**          | 20.x    | JavaScript runtime | Industry standard, required by Vercel         |
| **Anthropic SDK**    | 0.20+   | AI API client      | Official Claude API wrapper                   |

### Development Tools

| Tool           | Purpose                                |
| -------------- | -------------------------------------- |
| **pnpm**       | Package manager (faster than npm)      |
| **ESLint**     | Code linting (catch errors)            |
| **Prettier**   | Code formatting (consistency)          |
| **TypeScript** | Type checking (compile-time safety)    |
| **Expo Go**    | Device testing (instant preview)       |
| **EAS Build**  | Cloud builds (iOS/Android compilation) |

---

## 3. System Components

### 3.1 Mobile Application Components

#### Presentation Layer

```
src/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Goals list screen
│   │   ├── timer.tsx        # Focus timer screen
│   │   ├── analytics.tsx    # Progress analytics
│   │   └── chat.tsx         # AI assistant
│   └── goal/
│       └── [id].tsx         # Goal detail screen
├── components/              # Reusable UI components
│   ├── GoalCard.tsx
│   ├── Timer.tsx
│   ├── ProgressRing.tsx
│   └── ChatBubble.tsx
└── styles/
    └── theme.ts             # Color palette, typography
```

#### Business Logic Layer

```
src/
├── hooks/                   # Custom React hooks
│   ├── useGoals.ts         # Goal CRUD operations
│   ├── useTimer.ts         # Timer state & logic
│   ├── useChat.ts          # AI chat interface
│   └── useAnalytics.ts     # Progress calculations
├── stores/                  # Zustand state stores
│   ├── goalStore.ts
│   ├── timerStore.ts
│   └── chatStore.ts
└── utils/
    ├── calculations.ts      # Efficiency formulas
    └── validators.ts        # Input validation
```

#### Data Access Layer

```
src/
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   ├── migrations/         # Database migrations
│   └── client.ts           # SQLite connection
└── api/
    └── chat.ts             # Backend API client
```

### 3.2 Backend Component

```
api/
└── chat.ts                 # Single serverless function
    ├── Rate limiting (60 req/min)
    ├── Input validation (sanitize user messages)
    ├── Context building (inject goal data)
    ├── Claude API call
    └── Error handling
```

**Why Single Endpoint?**

- No complex routing needed.
- Simple to maintain.
- Sufficient for MVP.
- Easy to monitor/debug

---

## 4. Data Flow Architecture

### 4.1 Offline Data Flow (Goal Management)

```
User creates goal
    ↓
1. UI validates input (client-side)
    ↓
2. Zustand store updates (optimistic UI)
    ↓
3. Drizzle ORM inserts to SQLite (transaction)
    ↓
4. On success: UI shows success feedback
   On error: Zustand rollback, show error toast
    ↓
5. Goal appears in list (React re-render)
```

**Code Example**

```typescript
async function createGoal(goalData: NewGoal) {
  // 1. Validate
  const validated = goalSchema.parse(goalData);

  // 2. Optimistic UI Update
  const tempId = crypto.randomUUID();
  goalState.addGoal({ ...validated, id: tempId });

  try {
    // 3. Persist to SQLite
    const [newGoal] = await db.insert(goals).values(validatied).returning();

    // 4. Replace temp with real ID
    goalStore.updateGoal(tempId, newGoal);

    return newGoal;
  } catch {
    // 4. Rollback on error
    goalStore.removeGoal(tempId);
    throw error;
  }
}
```

### 4.2 Focus Session Data Flow

```
User starts timer (25 min)
    ↓
1. Write to SQLite: { startTime: now(), goalId, status: 'active' }
    ↓
2. Set Zustand: { isRunning: true, timeRemaining: 1500, sessionId }
    ↓
3. Countdown updates Zustand every second (UI only, no DB writes)
    ↓
Timer completes
    ↓
4. Update SQLite: { endTime: now(), duration: 25, status: 'completed' }
    ↓
5. Recalculate goal progress (hours logged += 0.42)
    ↓
6. Update Zustand with new progress
    ↓
7. UI re-renders (goal card shows updated progress)
    ↓
8. Show notification: "25 minutes logged to [Goal Name]
```

**Crash Recovery:**

```typescript
// On app startup
const activeSession = await db
  .select()
  .from(focusSessions)
  .where(eq(focusSessions.status, "active"))
  .get();

if (activeSession) {
  const elapsed = Date.now() - activeSession.startTime;
  const remaining = 25 * 60 * 1000 - elapsed;

  if (remaining > 0) {
    // Resume timer
    timeStore.resume(activeSession.id, remaining);
  } else {
    // Auto-complete expired session
    await completeSession(activeSession.id);
  }
}
```

### 4.3 AI Chat Data Flow (Online Only)

```
User sends message: "Which goal should I focus on today?"
    ↓
1. Check internet connectivity
   ├─ Offline: Show "AI requires internet" banner
   └─ Online: Continue
    ↓
2. Read user's goals from SQLite
    ↓
3. Build context payload:
   {
     message: "Which goal...",
     goals: [
       { title: "DevOps Course", progress: 87%, daysLeft: 12 },
       { title: "Side Project", progress: 62%, daysLeft: 21 }
     ],
     recentSessions: [ ... last 7 days ... ]
   }
    ↓
4. POST to /api/chat with payload
    ↓
BACKEND PROCESSING:
    ↓
5. Rate limit check (60 req/min per device)
    ↓
6. Validate message (length, sanitize)
    ↓
7. Build prompt:
   """
   You are a productivity coach. The user has these goals:
   - DevOps Course: 87% complete, 12 days left (ON TRACK)
   - Side Project: 62% complete, 21 days left (BEHIND)

   Recent activity: Worked 4.2 hours in last 7 days.

   User asks: "Which goal should I focus on today?"
   """
    ↓
8. Call Claude API
    ↓
9. Receive response:
   "I recommend focusing on the Side Project today since you're
   falling behind schedule. You need ~2 hours/day to catch up..."
    ↓
10. Return to mobile app
    ↓
11. Save message + response to SQLite (chat history)
    ↓
12. Update Zustand chat store
    ↓
13. UI displays AI message with typing animation
```

---

## 5. Database Design

### 5.1 Database Schema

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  title: text("id").notNull(),
  description: text("description"),
  targetHours: real("target_hours").notNull(),
  hoursLogged: real("hours_logged").default(0),
  deadlineDays: integer("deadline_days"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("active"), // active | completed | archived
  color: text("color").notNull().default("#3b82f6"),
  efficiency: real("efficiency"), // Pre-calculated and updated on focus session
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  orderIndex: integer("order_index").notNull(),
});

export const focusSessions = sqliteTable("focus_sessions", {
  id: text("id").primaryKey(),
  goalId: text("goal_id")
    .notNull().
    .references(() => goals.id, { onDelete: "cascade" }),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  durationMinutes: real("duration_minutes"),
  status: text("status").notNull().default("active"), // active | completed | cancelled
  notes: text("notes"),
});

export const dailyProgress = sqliteTable("daily_progress", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  totalMinutes: real("total_minutes").notNull(),
  goalsWorkedOn: integer("goals_worked_on").default(0),
  streakCount: integer("streak_count").default(1),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  contextSnapshot: text("context_snapshot"), // JSON of goals at time of message
});
```

### 5.2 Indexes (Performance Optimization)

```sql
-- Index for filtering focus sessions by date (analytics queries)
CREATE INDEX idx_focus_sessions_start_time
ON focus_sessions(start_time);

-- Index for getting active sessions (timer recovery)
CREATE INDEX idx_focus_sessions_status
ON focus_sessions(status)
WHERE status = 'active';

-- Index for daily progress lookups
CREATE INDEX idx_daily_progress_date
ON daily_progress(date);

-- Composite index for goal-specific queries
CREATE INDEX idx_milestones_goal_order
ON milestones(goal_id, order_index);
```

### 5.3 Data Integrity Rules

1. **Cascade Deletes:** When a goal is deleted, all milestones and sessions are deleted.
2. **Constraints:**
   - Goal titles must be unique.
   - Target Hours > 0
   - Hours Logged >= 0
   - Deadline Days >= 1 if set
3. **Transactions:** All multi-table operations use SQLite transactions.
4. **No Soft Deletes:** Deleted data is truly deleted (privace-first)

---

## 6. State Management

### 6.1 Zustand vs SQLite Decision Matrix

| Data Type                  | Storage                                   | Reasoning                                       |
| -------------------------- | ----------------------------------------- | ----------------------------------------------- |
| **Current active goal ID** | Zustand                                   | Ephemeral UI state (doesn't need persistence)   |
| **Goal list**              | SQLite (cached in Zustand)                | Persistent data, pre-loaded on app start        |
| **Timer state**            | **Both**                                  | SQLite (crash recovery), Zustand (countdown UI) |
| **Chat messages**          | SQLite (cached in Zustand)                | Persistent, but recent 50 loaded in memory      |
| **Daily total hours**      | Calculated from SQLite, cached in Zustand | Derived state, recomputed on session end        |
| **Form inputs**            | Zustand (or useState)                     | Temporary, discarded on cancel                  |

### 6.2 Zustand Store Structure

```typescript
// src/stores/goalStore.ts
interface GoalStore {
  goals: Goal[];
  activeGoalId: string | null;
  isLoading: boolean;

  // Actions
  loadGoals: () => Promise<void>;
  addGoal: (goal: NewGoal) => Promise<Goal>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setActiveGoal: (id: string | null) => void;
}

// src/stores/timerStore.ts
interface TimerStore {
  sessionId: string | null;
  goalId: string | null;
  isRunning: boolean;
  timeRemaining: number; // seconds
  mode: "pomodoro" | "custom" | "stopwatch";

  // Actions
  startTimer: (goalId: string, duration: number) => Promise<void>;
  completeTimer: () => Promise<void>;
  cancelTimer: () => Promise<void>;
  tick: () => void; // Called every second
  pauseTimer: () => void; // NOT IMPLEMENTED (prevents gamin)
}

// src/stores/chatStore.ts
interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  isOffline: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}
```

### 6.3 State Synchornization Pattern

How do we keep the UI in sync with the data stored in SQLite.

```typescript
// Pattern: SQLite -> Zustand -> React UI

// 1. On app startup
useEffect(() => {
  goalStore.loadGoals(); // Read from SQLite & Populate Zustand
}, []);

// 2. On user action
async function handleCreateGoal(data: NewGoal) {
  // Write to SQLite first (source of truth)
  const newGoal = await db.insert(goals).values(data).returning();

  // Update Zustand (triggers React re-render)
  goalStore.setState(state => ({
    goals: [...state.goals, newGoal]
  }));
}

// 3. React components read from Zustand
function GoalList() {
  const goals = goalStore(state => state.goals); // Auto re-renders

  return goals.map(goal => <GoalCard key={goal.id} goal={...goal} />);
}
```

---

## 7. API Architecture

### 7.1 Endpoint Specification

**Base URL:** `https://locked-in.vercel.app/api`

#### POST /api/chat

**Purpose:** Send user message to AI assistant with goal context

**Request:**

```typescript
{
  message: string; // User's question (max 2000 chars)
  deviceId: string; // Unique device identifier
  goals: {
    id: string;
    title: string;
    progress: number; // 0-100
    efficiency: number; // 0-200+
    hoursLogged: number;
    targetHours: number;
    daysLeft: number | null;
    status: "on_track" | "at_risk" | "behind";
  }
  [];
  recentSessions: {
    goalTitle: string;
    date: string; // YYYY-MM-DD
    duration: number; // minutes
  }
  [];
}
```

**Response (Success):**

```typescript
{
  message: string; // AI response
  tokensUsed: number; // For monitoring costs
}
```

**Response (Error):**

```typescript
{
  error: string; // Error message
  code: "RATE_LIMIT" | "VALIDATION_ERROR" | "API_ERROR" | "NETWORK_ERROR";
}
```

**Security Headers:**

```
Content-Type: application/json
X-Device-ID: <uuid>
X-Request-ID: <uuid>          // For debugging
```

### 7.2 Context Building Strategy

**Goal:** Give Claude enough info to be helpful, but not so much that tokens are wasted.

```typescript
function buildContextPrompt(data: ChatRequest): string {
  const { goals, recentSessions, message } = data;

  // 1. Summarize goals
  const goalsSummary = goals
    .map(
      (goal) =>
        `- ${goal.title}: ${goal.progress}% complete, ` +
        `${goal.daysLeft ? `${goal.daysLeft} days left` : "no deadline"}, ` +
        `(${goal.status.toUpperCase()})`,
    )
    .join("\n");

  // 2. Summarize recent activity
  const totalMinutes = recentSessions.reduce(
    (sum, session) => sum + session.duration,
    0,
  );
  const uniqueGoals = new Set(
    recentSessions.map((session) => session.goalTitle),
  ).size;

  return `You are a productivity coach helping a user optimize their goals.

  CURRENT GOALS:
  ${goalsSummary}

  RECENT ACTIVITY (Last 7 Days):
  - Total focus time: ${(totalMinutes / 60).toFixed(1)} hours
  - Goals worked on: ${uniqueGoals}
  ${recentSessions.length === 0 ? "- No sessions logged yet" : ""}

  USER QUESTION:
  ${message}

  Provide specific, actionable advice based on their actual data. Be concise.`;
}
```

**Token Budget:**

- Context: ~500 tokens
- User message: ~100 tokens
- Response: ~400 tokens
- **Total:** ~1000 tokens/request (~$0.003 per message)

---

## 8. Security Architecture

### 8.1 Threat Model
