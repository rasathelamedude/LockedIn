# Requirements & Specifications

## Project Overview

**LockedIn** is a cross-platform mobile application designed to help users get rid of mental clutter by tracking short-term goals, measuring productivity efficiency, and receiving AI-powered guidance for goal optimization. The application operates offline-first with optional online AI assistant capabilities.

---

## 1. Functional Requirements

### 1.1 Goal Management

#### FR-1.1: Create Goals

- **Description:** Users can create short-term goals with customizable parameters.
- **Inputs:**
  - Goal Title (required, 3-100 characters)
  - Goal Description (optional, max 500 characters)
  - Daily Target Hours (required, 0.5-10000 hours)
  - Deadline in Days (optional, 1-365 days)
  - Goal Color Theme (options, 6 pre-set colors)
- **Validation:**
  - Goal title must be unique per user.
  - Target hours must be a positive number.
  - Deadline must be a future date if provided.
- **Acceptance Criteria:**
  - Users can create unlimited goals.
  - Goals persist on app restarts.
  - Goal appears in goal list immediately after creation.

#### FR-1.2: View Goals

- **Description:** Display all active goals with progress and efficiency indicators.
- **Display Information:**
  - Goal title and description
  - Progress percentage (hours logged / target hours \* 100)
  - Efficiency index
  - Hours remaining to reach target
  - Days remaining until deadline
  - Current status (On track / At risk / Behind)
- **Sorting Options:**
  - By deadline (most urgent first)
  - By progress (least completed first)
  - By efficiency index (least productive first)
  - By recently created
- **Acceptance Criteria**
  - Empty state shows (Create your first goal) prompt.
  - Status calculation updates automatically.
  - Progress updates immediately after focus session

#### FR-1.3: Edit Goals

- **Description:** Users can modify goal parameters.
- **Editable feilds:** All feilds from FR-1.1.
- **Constraints:**
  - Cannot change deadline to a past date.
  - Cannot reduce target hours below what's already logged.
- **Acceptance Criteria**
  - Milestones remain linked to the goal.
  - Changes reflect in the UI immediately.
  - Progress percentage and efficiency index recalculates correctly.

#### FR-1.4: Delete Goals

- **Description:** Users can remove goals permanently.
- **Behavior:**
  - Show confirmation dialoug before deletion.
  - Cascade delete all assocaited milestones and focus sessions.
- **Acceptance Criteria**
  - Deleted goal doesn't show in the active list.
  - Focus session history is preserved.

---

### 1.2 Milestone Tracking

#### FR-2.1: Create Milestones

- **Description:** Users can break down goals into smaller checkpoints by creating milestons.
- **Inputs:**
  - Milestone title (required, 3-100 characters)
  - Order / sequence number (auto assigned)
- **Constraints:**
  - Minimum 1 milestone per goal
  - Maximum 20 milestones per goal
- **Acceptance Criteria:**
  - Milestones appear in order below goal.
  - Users can reorder milestones via drag-and-drop.

#### FR-2.2: Complete Milestones

- **Description:** Users can mark milestones as done.
- **Behavior:**
  - Visual checkmark animation on tap.
  - Records completion timestamp.
  - Cannot uncomplete once marked (for data integrity)
- **Acceptance Criteria:**
  - Compeleted milestones show timestamp
  - Progress indicator updates to reflect milestone completion.
  - Completion persists offline.

---

### 1.3 Focus Sessions

#### FR-3.1: Start Focus Timer

- **Description:** Users can begin timed work session for a specific goal.
- **Timer Modes:**
  - **Pomodoro:** 25 minutes default (customizable 5-60 minutes)
  - **Custom:** Users set duartions (5-240) minutes
  - **Stopwatch:** Open-ended sessions
- **Behavior:**
  - Timer runs in the background (app can be minimized).
  - Shows notification when session completes.
  - Only one active session at a time is allowed.
- **Acceptance Criteria:**
  - Timer accuracy is within ±2 seconds.
  - Timer survives app restarts.
  - Push notification on completion (with permission).

#### FR-3.2: End Focus Session

- **Description:** Users can complete or cancel active session.
- **Actions:**
  - **Complete:** Logs full session time to goal
  - **Cancel:** Discards session with confirmation
  - **Pause/Resume:** Not supported (prevents gaming the system)
- **Data Recorded:**
  - Start timestamp
  - End timestamp
  - Duration
  - Associated Goal ID
  - Optional session notes
- **Acceptance Criteria:**
  - Logged hours update goal progress immediately.
  - Logged hours update efficiency index immediately.
  - Session appears in daily progress summary.
  - Cannot manipulate session history (read-only)

#### FR-3.3: View Focus History

- **Description:** Users can see past focus sessions.
- **Display:**
  - List of all sessions, grouped by date.
  - Goal name, duration, timestamp.
  - Total focus time per day/week/month
- **Acceptance Criteria:**
  - History loads within 500ms for 1000+ sessions
  - User can filter by date range

---

### 1.4 Progress Analytics

#### FR-4.1: Daily Progress Tracking

- **Description:** Monitor daily productivity metrics.
- **Metrics Displayed:**
  - Total focus hours today.
  - Number of goals worked on.
  - Streak count (Consecutive days with sessions)
  - On Track status (green if hours >= daily target)
- **Acceptance Criteria:**
  - Updates every time session ends.
  - Resets at midnight local time.
  - Historical data is preserved.

#### FR-4.2: Efficiency Index Calculation

- **Description**: Calculate productivity efficiency
- **Formula**:

  ```
  Efficiency = (Actual Hours Logged / Expected Hours by Now) × 100

  Where Expected Hours = (Total Target Hours / Days Until Deadline) × Days Elapsed
  ```

- **Display**:
  - Percentage with color coding:
    - 🟢 Green: ≥100% (ahead)
    - 🟡 Yellow: 80-99% (on track)
    - 🔴 Red: <80% (behind)
- **Acceptance Criteria:**
  - Recalculates in real-time
  - Handles goals without deadlines gracefully
  - Shows "N/A" for brand new goals

#### FR-4.3: Goal Status Indicators

- **Description**: Visual cues for goal health
- **Status Types**:
  - **On Track**: Efficiency ≥ 90%
  - **At Risk**: Efficiency 70-89%
  - **Behind**: Efficiency < 70%
  - **Completed**: Hours logged ≥ target hours
- **Acceptance Criteria:**
  - Status badge visible on goal cards.
  - Updates without page refresh.
  - Push notification when status changes to "At Risk".

---

### 1.5 AI Assistant (Online Only)

#### FR-5.1: Chat interface

- **Description:** Conversational AI to help with goal planning.
- **Features:**
  - Text input with multiline support
  - Message history (persisted locally)
  - Typing indicator while AI responds
  - Copy/share AI responses
- **Context Awareness:**
  - AI has read-only access to:
    - All user goals and milestones
    - Focus session history (last 30 days)
    - Current efficiency indecies
- **Acceptance Criteria:**
  - Messages appear in chat within 3 seconds.
  - Greaceful error handling when offline.
  - Character limit: 2000 characters per message.

#### FR-5.2 Goal Optimization Suggestions

- **Description:** AI provides actionable advice.
- **Example Prompts:**
  - "Which goal should I focus on today?"
  - "Help me break down 'Complete DevOps Course' into milestones"
  - "Why am I behind on my goals?"
- **AI Capabilities:**
  - Analyze time ddistrbution across goals.
  - Suggest milestone breakdown.
  - Identify bottlenecks (e.g., too many active goals)
  - Recommend daily focus hours.
- **Acceptance Criteria:**
  - Responses are relevant to user's actual data.
  - AI doesn't invent data (no hallucinations).
  - Suggestions are specific, not generic advice.

#### FR-5.3: Offline Fallback

- **Description**: Handle lack of internet gracefully.
- **Behavior**:
  - Show "Offline" badge in chat
  - Display message: "AI assistant requires internet. Your goals are safe and synced locally."
  - Queue user messages (don't allow sending)
- **Acceptance Criteria**:
  - No crashes when offline.
  - Clear UX communication.
  - Auto-reconnect when internet returns

---

## 2. Non-Functional Requirements

### 2.1 Performance

| Metric                    | Target      | Measurement                         |
| ------------------------- | ----------- | ----------------------------------- |
| **App Launch Time**       | < 2 seconds | Cold start to interactive UI        |
| **Database Query Time**   | < 100ms     | Any SQLite read operation           |
| **UI Response Time**      | < 16ms      | Touch to visual feedback (60fps)    |
| **AI Response Time**      | < 5 seconds | User message to first token         |
| **Offline Functionality** | 100%        | All features except AI work offline |

### 2.2 Reliability

- **Uptime:** Backend API: 99.5% (Vercel SLA)
- **Data Loss Prevention:**
  - SQLite transactions with rollback.
  - Automatic backups to device storage (daily).
  - No destructive operations without confirmation
- **Error Recovery:**
  - App crashes: Auto restart and restore state.
  - Failed API calls: Retry with exponential backoff (3 attempts).

### 2.3 Security

- **Data Storage**:
  - SQLite database encrypted at rest (OS-level)
  - No cloud sync (all data local)
  - API keys never stored on device
- **API Security**:
  - Backend uses environment variables for secrets
  - Rate limiting: 60 requests/minute per IP
  - Input sanitization on all user messages
- **Privacy**:
  - No user accounts (no PII collected)
  - No analytics/tracking
  - AI conversations not logged on server

### 2.4 Usability

- **Accessability:**
  - WCAG 2.1 Level AA compliance.
  - Screen reader support (iOS VoiceOver, Android TalkBack).
  - Minimum touch target: 44x44 pt.
  - Color contrast ratio: 4.5.1 for text.
- **Internationalization:**
  - Initial release: English only.
  - Date/Time formatting respects device locale
  - Number formatting (1,234.56)

### 2.5 Compatibility

| Platform         | Minimum Version | Target Version     |
| ---------------- | --------------- | ------------------ |
| **iOS**          | 13.0            | 18.0               |
| **Android**      | 8.0 (API 26)    | 14.0 (API 34)      |
| **Screen Sizes** | 4.7" to 6.9"    | All modern phones  |
| **Orientation**  | Portrait only   | Landscape disabled |

---

## 3. Technical Constraints

### 3.1 Technology Decisions

| Component            | Technology                  | Rationale                                            |
| -------------------- | --------------------------- | ---------------------------------------------------- |
| **Framework**        | React Native (Expo)         | Cross-platform, rapid development, large ecosystem   |
| **Language**         | TypeScript                  | Type safety, better DX, maintainability              |
| **Database**         | SQLite (Expo SQLite)        | Offline-first, zero-config, SQL standard             |
| **ORM**              | Drizzle                     | Type-safe queries, lightweight, SQLite support       |
| **State Management** | Zustand                     | Simple API, no boilerplate, 1kb size                 |
| **Styling**          | NativeWind (Tailwind)       | Utility-first, consistent with web, fast prototyping |
| **Backend**          | Vercel Serverless Functions | Zero DevOps, auto-scaling, free tier                 |
| **AI Provider**      | Anthropic Claude            | Best reasoning, long context, ethical AI             |

### 3.2 Scalability Limits

- **Max Goals per User:** 100 (UI degrades beyond this).
- **Max Milestones per Goal:** 20 (UX constraint).
- **Max focus Sessions Stored:** 10,000 (~27 years of daily use).
- **Chat History:** Last 50 messages (older archived).
- **Concurrent Users:** Unlimited (no shared backend state).

---

## 4. User Stories

### Epic 1: Goal Management

```
As a user, I usually feel lost and overwhelmed by the amount of things I want to achieve short-term. I want to create and track multiple short-term goals, So that I can organize my learning and work objectives.
```

**User Stories:**

1. US-1.1: As a user, I want to set a target number of hours for each goal, so I know how much work is required.
2. US-1.2: As a user, I want to see my progress as a percentage, so I can quickly gauge completion.
3. US-1.3: As a user, I want to set deadlines, so I stay accountable.

### Epic 2: Focus & Time Tracking

```
As a user,
I want to log time spent working on goals,
So that I can measure my actual effort versus planned effort.
```

**User Stories:**

1. US-2.1: As a user, I want to start a focus timer, so I can work without distractions.
2. US-2.2: As a user, I want the timer to run in the background, so I can use other apps.
3. US-2.3: As a user, I want to see my daily total focus time, so I can track consistency.

### Epic 3: AI-Powered Insights

```
As a user,
I want AI-driven suggestions for improving my goal strategy,
So that I can work smarter, not just harder.
```

**User Stories:**

1. US-3.1: As a user, I want to ask the AI which goal to prioritize, so I make better decisions.
2. US-3.2: As a user, I want the AI to break down complex goals, so I have clear next steps.
3. US-3.3: As a user, I want the AI to analyze why I'm behind, so I can course-correct.

---

## 5. Out of Scope (Future Enhancements)

The following features are **not** included in the initial release:

- User accounts / cloud sync
- Social features (share goals, leaderboards)
- Habit tracking (this is for short-term goals only)
- Calendar integration
- Reminders/notifications (beyond focus timer completion)
- Dark mode customization (system theme only)
- Export to PDF/CSV
- Web version
- Tablet/iPad optimization
- Voice input for AI chat
- Multi-language support

---

## 6. Success Metrics (Post-Launch)

For evaluating the app's effectiveness:

| Metric                   | Target                       | How to Measure       |
| ------------------------ | ---------------------------- | -------------------- |
| **User Retention**       | 40% Day 7 retention          | Analytics (if added) |
| **Goal Completion Rate** | 30% of goals marked complete | Database query       |
| **Avg Daily Focus Time** | 2+ hours per active user     | Focus session logs   |
| **AI Engagement**        | 20% of users chat weekly     | Message count        |
| **Crash-Free Rate**      | 99%+                         | Error monitoring     |

---

## 7. Success Criteria (Project Complete When...)

- User can create, edit, delete goals offline
- User can track time with focus sessions
- Progress calculations are accurate
- AI assistant provides relevant, context-aware advice
- App works 100% offline except AI feature
- No data loss after app crashes or restarts
- App passes manual testing on iOS and Android
- Code is documented and follows TypeScript best practices
- README, ARCHITECTURE, and DATABASE_SCHEMA docs are complete
- APK/IPA builds successfully via EAS Build

---

## Documentation Version

- **Version**: 1.0
- **Last Updated**: January 21, 2026
- **Author**: Rasyar Safin Mustafa
