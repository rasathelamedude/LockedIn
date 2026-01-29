import { getAllActiveGoals } from "@/database/queries/goals";
import { getActiveSessions } from "@/database/queries/sessions";
import { create } from "zustand";
import { getDeviceId } from "../utils/deviceId";

interface AssistantStore {
  error: string | null;
  loading: boolean;
  messages: Message[];

  addMessage: (message: Message) => Promise<void>;
}

export interface Message {
  role: string;
  content: string;
  timestamp: number;
}

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  error: null,
  loading: false,
  messages: [],

  addMessage: async (message: Message) => {
    // Add message
    set((state) => ({ messages: [...state.messages, message] }));

    // if it's user's message, fetch AI response
    if (message.role === "user") {
      set({ loading: true, error: null });

      try {
        const goals = await getAllActiveGoals();
        const sessions = await getActiveSessions();
        const deviceId = await getDeviceId();

        const response = await fetch(
          "https://lockedin-tau-black.vercel.app/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-device-id": deviceId,
            },
            body: JSON.stringify({
              message: message.content,
              goals: goals.map((goal) => ({
                title: goal.title,
                progress: Math.round(goal.hoursLogged / goal.targetHours) * 100,
                status: goal.status,
              })),
              sessions: sessions.map((session) => ({
                date: new Date(session.startTime).toISOString().split("T")[0],
                duration: session.durationMinutes,
              })),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();

        // Get AI message
        const AIMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, AIMessage],
          loading: false,
        }));
      } catch (error) {
        console.error(`Error occured while fetching AI response: ${error}`);
        // remove the message added
        set((state) => ({
          messages: state.messages.filter(
            (stateMessage) => stateMessage.content !== message.content,
          ),
          error: (error as Error).message,
          loading: false,
        }));
      }
    }
  },
}));
