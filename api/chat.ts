import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1m"),
});

export default async function handler(request: Request): Promise<Response> {
  // 1. Rate limit
  const deviceId = request.headers.get("X-Device-ID");
  if (!deviceId) {
    return new Response("Missing Device ID", { status: 400 });
  }

  const { success } = await ratelimit.limit(deviceId);
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }

  // 2. Parse request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Invalid JSON:", error);
    return new Response("Invalid JSON", { status: 400 });
  }

  // 3. Validate input
  if (
    !body.message ||
    typeof body.message !== "string" ||
    body.message.length > 2000
  ) {
    return new Response("Invalid input", { status: 400 });
  }

  if (!Array.isArray(body.goals)) {
    return new Response("Invalid goals format", { status: 400 });
  }

  if (!Array.isArray(body.sessions)) {
    return new Response("Invalid sessions format", { status: 400 });
  }

  // 4. Sanitize input
  const sanitizedMessage = body.message
    .trim()
    .replace(/<[^>]*>?/gm, "")
    .replace(/```/g, "");

  // 5. Build context
  const goalsSummary = body.goals
    .map(
      (goal: { title: string; progress: string; status: string }) =>
        `- ${goal.title}: ${goal.progress}% (${goal.status || "active"})`,
    )
    .join("\n");

  const sessionsSummary = body.sessions
    .slice(0, 10)
    .map(
      (session: { date: string; duration: number }) =>
        `- ${session.date}: ${session.duration} minutes`,
    )
    .join("\n");

  const prompt = `You are a productivity coach helping users optimize their goals.

            CURRENT GOALS:
            ${goalsSummary}

            RECENT ACTIVITY (Last 7 days):
            ${sessionsSummary || "- No recent activity"}

            USER QUESTION:
            ${sanitizedMessage}

            Provide specific, actionable advice based on their data. Be concise (max 3 paragraphs).`;

  // 6. Call LLM API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    clearTimeout(timeoutId);

    const aiResponse = result.response.text();

    // 7. Send Response
    return new Response(JSON.stringify({ message: aiResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return new Response("LLM request timed out", { status: 504 });
    }

    console.error("Gemini API error:", error);
    return new Response("AI Service unavailable", { status: 503 });
  }
}
