import {
  cancelSession,
  completeSession,
  startSession,
} from "@/database/queries/sessions";
import { create } from "zustand";

interface TimerStore {
  loading: boolean;
  isRunning: boolean;
  sessionId: string | null;
  goalId: string | null;
  timerId: number | null;
  timeRemaining: number;

  startTimer: (goalId: string) => Promise<void>;
  completeTimer: () => Promise<void>;
  cancelTimer: () => Promise<void>;
  tick: () => void;
  stopTick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  loading: false,
  isRunning: false,
  sessionId: null as string | null,
  goalId: null as string | null,
  timerId: null as number | null,
  timeRemaining: 25 * 60,

  startTimer: async (goalId: string) => {
    set({
      loading: true,
      isRunning: true,
      sessionId: null,
      goalId: null,
    });

    try {
      // Start a new session in the database
      const session = await startSession(goalId);

      set({
        sessionId: session.id,
        goalId: goalId,
        loading: false,
        isRunning: true,
      });

      // Start the timer
      get().tick();
    } catch (error) {
      console.error(`Failed to start a timer: ${error}`);
      set({
        loading: false,
        isRunning: false,
        sessionId: null,
        goalId: null,
        timeRemaining: 25 * 60,
      });
      throw error;
    }
  },

  tick: () => {
    /**
     *
     * 1. Remove old timer if exists
     * 2. Set new timer that timer ticks every second
     * 3. After each tick
     *  - Checks if it should still run
     *  - Reduce time remaining by 1 second
     *  - Completes the session if timer reaches 0
     *
     */

    const { timerId } = get();

    // Clear old timer
    if (timerId) {
      clearInterval(timerId);
    }

    // Set up new timer
    const newTimerId: number = setInterval(() => {
      const { isRunning, timeRemaining } = get();

      // Should the timer still run?
      if (!isRunning) {
        clearInterval(newTimerId);
        set({ timerId: null });
        return;
      }

      // Reduce time remaining
      set({ timeRemaining: timeRemaining - 1 });

      // Did the timer reach 0?
      if (timeRemaining === 0) {
        clearInterval(newTimerId);
        set({ timerId: null });
        get().completeTimer();
      }
    }, 1000);

    set({ timerId: newTimerId });
  },

  stopTick: () => {
    const { timerId } = get();
    if (timerId) {
      clearInterval(timerId);
      set({ timerId: null });
    }
  },

  completeTimer: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    get().stopTick();

    set({ loading: true });
    try {
      // Complete the session in the database
      await completeSession(sessionId);
      set({
        isRunning: false,
        sessionId: null,
        goalId: null,
        timeRemaining: 25 * 60,
      });
    } catch (error) {
      console.error(`Failed to complete a timer: ${error}`);
      set({
        loading: false,
        isRunning: false,
        sessionId: null,
        goalId: null,
        timeRemaining: 25 * 60,
      });
      throw error;
    }
  },

  cancelTimer: async () => {
    const { sessionId } = get();

    if (!sessionId) return;

    get().stopTick();

    set({ loading: true });
    try {
      await cancelSession(sessionId);
      set({
        isRunning: false,
        sessionId: null,
        goalId: null,
        timeRemaining: 25 * 60,
      });
    } catch (error) {
      console.error(`Failed to cancel a timer: ${error}`);
      set({ loading: false });
      throw error;
    }
  },
}));
