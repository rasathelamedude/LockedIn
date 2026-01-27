# System Architecture

## Document Overview

This document describes the technical architecture of **LockedIn**, a cross-platform mobile application for goal tracking and AI-powered productivity optimization.

**Last Updated:** January 27th 2026
**Version:** 1.1
**Author:** Rasyar Safin Mustafa

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Stack](#2-technology-stack)
3. [System Components](#3-system-components)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [Database Design](#5-database-design)
6. [State Management](#6-state-management)
7. [API Architecture](#7-api-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Error Handling](#9-error-handling)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Performance Considerations](#11-performance-considerations)
12. [Trade-offs & Constraints](#12-trade-offs--constraints)

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

| Threat                | Impact                                     | Mitigation                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------- |
| **API key theft**     | Unlimited Claude API usage, financial loss | Store in Vercel env vars, never in app code |
| **Rate limit bypass** | Backend spam, high costs                   | Device ID tracking, IP rate limiting        |
| **SQLite data theft** | User's goals/data exposed                  | Device encryption (OS-level), no cloud sync |
| **Prompt injection**  | AI gives harmful advice                    | Input sanitization, system prompt hardening |
| **Man-in-the-middle** | Intercept API traffic                      | HTTPS only (enforced by Vercel)             |

### 8.2 Security Implementation

#### Backend Security

````typescript
// api/chat.ts
import rateLimit from "@vercel/edge-rate-limit";

const limiter = rateLimit({
  interval: "1m";
  uniqueTokenPerInterval: 500, // max 500 device per minute
});

export default async function handler(req: Request) {
  // 1. Rate limit
  const deviceId = req.headers.get("x-device-id");
  const {success} = await limiter.check(60, deviceId);

  if (!success) {
    return new Response("Rate limit exceeded", {status: 429});
  }

  // 2. Input validation
  const body = await req.json();
  if (!body.message || body.message.length > 2000) {
    return new Response("Invalid message", { status: 400 });
  }

  // 3. Input Sanitization (prevent prompt injection)
  const sanitized = body.message.replace(/<script>/gi, "").replace(/```/g, ""); // block code fences

  // 4. API call with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // abort after 30s

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      signal: controller.signal,
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max-token: 1024,
        message: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    clearTimeout(timeoutId);
    return response;
  } catch {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return new Response("Request timeout", { status: 408 });
    }
    throw error;
  }
}
````

#### Mobile App Security

```typescript
// Generate Device ID on app startup
async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync("device_id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await SecureStore.setItemAsync("device_id", deviceId);
  }

  return deviceId;
}

// All API calls include the device ID
async function callChatAPI(message: string, goals: Goal[]) {
  const deviceId = await getDeviceId();

  const response = await fetch("https://locked-in.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-ID": deviceId,
    },
    body: JSON.stringify({message, goals});
  });

  if (!response.ok) {
    throw new APIError(response.status, await response.text());
  }

  return response.json();
}
```

### 8.3 Privacy Gurantees

1. **No User Accounts:** No email, password, or PII collected
2. **Local-Only Data:** SQLite never leaves device
3. **Ephemeral Chat Context:** Backend doesn't log conversations
4. **No Analytics:** No Firebase, Mixpanel, Segment, etc.
5. **Open Source:** Code reviewable on GitHub

---

## 9. Error Handling

### 9.1 Error Taxonomy

| Category              | Examples                           | Handling Strategy                    |
| --------------------- | ---------------------------------- | ------------------------------------ |
| **Network Errors**    | No internet, timeout, DNS failure  | Retry with backoff, show offline UI  |
| **Validation Errors** | Invalid goal title, negative hours | Show error toast, prevent submission |
| **Database Errors**   | SQLite locked, disk full           | Transaction rollback, alert user     |
| **API Errors**        | Rate limit, Claude downtime        | Graceful degradation, queue retry    |
| **Unexpected Errors** | Null pointer, JSON parse fail      | Sentry logging, show generic error   |

### 9.2 Error Handling Patterns

#### API Call with Retry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status >= 500) {
        // Server error, retry
        throw new Error(`Server error: ${response.status}`);
      }

      return response;
    } catch (err) {
      lastError = err;

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i)),
      );
    }
  }

  throw lastError!;
}
```

#### Database Transaction Pattern

```typescript
async function createGoalwithMilestones(
  goalData: NewGoal,
  milestones: NewMilestone[],
) {
  return db.transaction(async (tx) => {
    // 1. Insert goal
    const [goal] = await tx.insert(goals).values(goalData).returning();

    // 2. Insert milestones (link to goal)
    const milestonesWithGoalId = milestones.map((milestone) => ({
      ...milestone,
      goalId: goal.id,
    }));

    await tx.insert(milestones).values(milestonesWithGoalId);

    // If any step fails entire transaction rollsback
    return goal;
  });
}
```

#### Global Error Boundary

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

export default function RootLayout() {
  return (
    <ErrorBoundary
      fallback={(error) => <ErrorScreen error={error} />}
      onError={(error, stackTrace) => {
        console.error('App error:', error);
        // Optional: Send to Sentry in production
        if (__DEV__ === false) {
          Sentry.captureException(error);
        }
      }}
    >
      <Stack />
    </ErrorBoundary>
  );
}
```

---

## 10. Deployment Architecture

### 10.1 Environment Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                          │
│  - Local machine (Expo Go)                              │
│  - Hot reload enabled                                   │
│  - Debug mode on                                        │
│  - Backend: http://localhost:3000/api/chat              │
│  - Test data in SQLite                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
                    git push dev
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     STAGING                             │
│  - Vercel preview deployment                            │
│  - URL: locked-in-git-staging.vercel.app                │
│  - Test Claude API with limited budget ($5)             │
│  - TestFlight (iOS) / Internal Testing (Android)        │
└─────────────────────────────────────────────────────────┘
                          ↓
                    git push main
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   PRODUCTION                            │
│  - Vercel production deployment                         │
│  - URL: locked-in.vercel.app                            │
│  - Full Claude API budget                               │
│  - App Store / Play Store (or GitHub Release APK)       │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Deployment Checklist

**Mobile App (EAS Build):**

```bash
# 1. Configure app.json
{
  "expo": {
    "name": "LockedIn",
    "slug": "locked-in",
    "version": "1.0.0",
    "ios": { "bundleIdentifier": "com.yourname.lockedin" },
    "android": { "package": "com.yourname.lockedin" },
    "extra": {
      "apiUrl": process.env.API_URL // Different per env
    }
  }
}

# 2. Build for production
eas build --platform all --profile production

# 3. Submit to stores (or download APK/IPA)
eas submit --platform ios
eas submit --platform android
```

**Backend (Vercel):**

```bash
# 1. Connect GitHub repo to Vercel

# 2. Configure environment variables in Vercel dashboard:
ANTHROPIC_API_KEY=sk-ant-api03-...
NODE_ENV=production

# 3. Deploy (automatic on git push)
git push origin main

# 4. Verify deployment
curl https://locked-in.vercel.app/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "goals": []}'
```

### 10.3 Rollback Strategy

**If production breaks:**

1. **Backend (Vercel):**

   ```bash
   # Instant rollback to previous deployment
   vercel rollback
   ```

2. **Mobile App (Expo OTA):**

   ```bash
   # Revert to previous update
   eas update --branch production --message "Rollback to v1.0.0"
   ```

3. **Database (SQLite):**
   - No centralized DB, each user's data is local
   - Include migration rollback in code:
   ```typescript
   if (dbVersion > APP_VERSION) {
     // Downgrade schema
     await db.execute(sql`ALTER TABLE goals DROP COLUMN new_field`);
   }
   ```

## 11. Performance Considerations

### 11.1 Mobile App Performance

| Optimization            | Implementation                                          | Impact                              |
| ----------------------- | ------------------------------------------------------- | ----------------------------------- |
| **List Virtualization** | Use `FlashList` instead of `FlatList` for goal list     | 10x faster scrolling for 100+ goals |
| **Image Optimization**  | No images (icon-only UI)                                | Smaller bundle size                 |
| **Code Splitting**      | Lazy load chat screen (only when needed)                | Faster initial load                 |
| **Database Indexing**   | Indexes on `date`, `status`, `goalId` columns           | 5-10x faster queries                |
| **Memoization**         | `useMemo` for expensive calculations (efficiency score) | Prevents unnecessary re-renders     |
| **Bundle Size**         | Tree-shaking, no unused libraries                       | <5MB app size                       |

**Performance Budget:**

```
- App launch: <2 seconds (cold start)
- Screen transition: <300ms
- Database query: <100ms
- UI interaction: 60fps (16ms per frame)
```

### 11.2 Backend Performance

| Metric           | Target        | How Achieved                          |
| ---------------- | ------------- | ------------------------------------- |
| **Cold Start**   | <500ms        | Vercel Edge Functions (vs Lambda ~2s) |
| **API Response** | <3s           | Claude Sonnet 4 (faster than Opus)    |
| **Throughput**   | 100 req/s     | Auto-scaling (Vercel handles)         |
| **Token Usage**  | <1500/request | Prompt engineering, context pruning   |

**Cost Optimization:**

```typescript
// Only send recent sessions, not all history
const recentSessions = await db
  .select()
  .from(focusSessions)
  .where(gt(focusSessions.startTime, sevenDaysAgo))
  .limit(50); // Cap at 50 sessions

// Summarize instead of sending raw data
const summary = `Worked on ${uniqueGoals} goals, ${totalHours} hours total`;
// vs sending 50 individual session objects (saves ~200 tokens)
```

---

## 12. Trade-offs & Constraints

### 12.1 Architecture Decisions & Rationale

#### Decision 1: No User Accounts

**Trade-off:**

- **Pro:** Privacy-first, no server costs, simpler architecture.
- **Cons:** No cross-device sync, data lost if phone lost.

**Rationale:** Aligns with privacy philosophy and MVP scope. Can add optional cloud backup in v2.

---

#### Decision 2: Single Backend Endpoint

**Trade-off:**

- **Pro:** Simple, easy to maintian, low overhead.
- **Con:** All logic in one function it could grow large.

**Rationale:** Sufficient for MVP. If chat grows complex (streaming or multi-turn) we can split into `/api/chat/send` and `/api/chat/stream`.

---

#### Decision 3: Zustand over Redux

**Trade-off:**

- **Pro:** 1kb vs 50kb, simple API, no boilerplate.
- **Con:** Less tooling, no Redux DevTools equivalent.

**Rationale:** Redux is overkill for this app's state complexity. Zustand's simplicity matchs project scope.

---

#### Decision 4: SQLite Over Cloud Database

**Trade-off:**

- **Pro:** Offline-first, instant queries, no backend costs.
- **Con:** No multi-device sync and manual backups.

**Rationale:** Primary use case is single-device tracking. Cloud DB adds latency and complexity for minimal benefit.

---

#### Decision 5: Expo over Bare React Native

**Trade-off:**

- **Pro:** 10x faster development, OTA updates, and managed builds;
- **Con:** Larger bundle (+2MB) and less control over native modules.

**Rationale:** For MVP/resume project, development speed > bundle size we can eject to bare React Native later if needed.

---

#### Decision 6: No Conversation Memory in Chat

**Trade-off:**

- **Pro:** Simpler backend, lower token costs and stateless.
- **Con:** AI can't reference previous messages.

**Rationale:** Most queries are standalone ("Which goal to focus on?"). Multi-turn convos are rare. We can add in v2 if users request.

---

#### Decision 7: Pre-Calculate Efficiency Score

**Trade-off:**

- **Pro:** Instant UI rendering, no computation lag.
- **Con:** Extra storage, must update every session.

**Rationale:** Efficiency is displayed on every goal card. Calculating 100 goals on every render would freeze UI.

---

### 12.2 Known Limitations

| Limitation                     | Impact                        | Workaround                                  |
| ------------------------------ | ----------------------------- | ------------------------------------------- |
| **Max 100 goals**              | UI degrades with 100+ items   | Show warning at 80 goals, suggest archiving |
| **No real-time collaboration** | Can't share goals with team   | Out of scope (single-user app)              |
| **Chat requires internet**     | Can't use AI offline          | Clear UI indicator, graceful fallback       |
| **No data export**             | Hard to migrate to other apps | Future: Add CSV export                      |

---

### 12.3 Future Enhancements (Out of Scope for V1)

1. **Optional Cloud Backup**
   - E2E encrypted backup to user's iCloud/Google Drive.
   - Restore on new device.
2. **Pomodoro Break Reminders**
   - Notifications for 5-min breaks.
   - Integration with Do Not Disturb mode.
3. **Export to Calendar**
   - Sync deadlines with Google Calendar.
4. **Collaborative Goals**
   - Share goals with accountability partners.
5. **Advanced Analytics**
   - Focus time heatmap.
   - Productivity trends over time.

---

## Appendix A: File Structure

```
locked-in/
├── app/                          # Expo Router (screens)
│   ├── (tabs)/
│   │   ├── index.tsx            # Goals list
│   │   ├── timer.tsx            # Focus timer
│   │   ├── analytics.tsx        # Progress stats
│   │   └── chat.tsx             # AI assistant
│   ├── goal/
│   │   └── [id].tsx             # Goal detail
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx           # 404 screen
├── components/                   # Reusable UI
│   ├── GoalCard.tsx
│   ├── Timer.tsx
│   ├── ProgressRing.tsx
│   ├── MilestoneItem.tsx
│   ├── ChatBubble.tsx
│   └── EmptyState.tsx
├── hooks/                        # Custom hooks
│   ├── useGoals.ts
│   ├── useTimer.ts
│   ├── useChat.ts
│   └── useAnalytics.ts
├── stores/                       # Zustand state
│   ├── goalStore.ts
│   ├── timerStore.ts
│   └── chatStore.ts
├── db/                           # Database layer
│   ├── schema.ts                # Drizzle schema
│   ├── migrations/              # SQL migrations
│   │   └── 0001_initial.sql
│   └── client.ts                # SQLite connection
├── api/                          # Backend (Vercel)
│   └── chat.ts                  # Serverless function
├── utils/                        # Helpers
│   ├── calculations.ts          # Efficiency formulas
│   ├── validators.ts            # Zod schemas
│   └── formatters.ts            # Date/number formatting
├── constants/
│   ├── Colors.ts                # Theme colors
│   └── Config.ts                # App config
├── types/
│   └── index.ts                 # TypeScript types
├── docs/                         # Documentation
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md          # This file
│   ├── DATABASE_SCHEMA.md
│   ├── API_REFERENCE.md
│   └── SETUP.md
├── package.json
├── tsconfig.json
├── app.json                      # Expo config
├── eas.json                      # Build config
└── README.md
```

## Appendix B: Technology Decisions Deep Dive

### Why TypeScript?

- **Type Safety:** Catches 70% of bugs at compile time
- **Better DX:** Autocomplete, inline docs, refactoring tools
- **Industry Standard:** 80% of React Native jobs require TS
- **Drizzle ORM:** Type-safe queries require TypeScript

### Why Drizzle Over Prisma/TypeORM?

- **Size:** 30kb vs 500kb (Prisma)
- **SQLite Support:** First-class support, no hacks
- **Type Inference:** Automatic, no codegen needed
- **Flexibility:** Raw SQL when needed

### Why Zustand Over Redux/MobX?

- **Learning Curve:** 15 min vs 2 hours (Redux)
- **Boilerplate:** 5 lines vs 50 lines for same store
- **Bundle Size:** 1kb vs 45kb (Redux + Toolkit)
- **Performance:** Similar to Redux, better than Context API

### Why NativeWind Over Styled-Components?

- **Consistency:** Same classes as web (Tailwind)
- **Performance:** Compiled at build time
- **Bundle Size:** No runtime CSS-in-JS overhead
- **Prototyping Speed:** Utility-first = fast iteration

### Why Expo Over Bare React Native?

- **Development Speed:** No Xcode/Android Studio setup
- **OTA Updates:** Fix bugs without app store review
- **Managed Builds:** EAS Build handles iOS/Android compilation
- **Ecosystem:** 50+ built-in modules (Camera, SQLite, etc.)

### Why Vercel Over AWS Lambda/Railway?

- **DX:** Deploy on `git push`, zero config
- **Cold Start:** Edge Functions <100ms vs Lambda ~2s
- **Free Tier:** 100k requests/month (AWS = 1M but worse DX)
- **Simplicity:** No VPC, IAM, or CloudFormation

### Why Claude Over GPT-4?

- **Context Window:** 200k tokens (GPT-4 = 128k)
- **Reasoning:** Better at structured tasks (goal analysis)
- **Ethics:** Anthropic's alignment research
- **Cost:** ~$3/M tokens (similar to GPT-4)

---

## Document Change Log

| Version | Date       | Changes                     | Author               |
| ------- | ---------- | --------------------------- | -------------------- |
| 1.0     | 2026-01-24 | Initial architecture design | Rasyar Safin Mustafa |

---
