import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1m"),
});

export default async function handler(req, res) {
  // 1. Rate limit
  const deviceId = req.headers["x-device-id"];
  if (!deviceId) {
    return res.status(400).send("Missing Device ID");
  }

  const { success } = await ratelimit.limit(deviceId);
  if (!success) {
    return res.status(429).send("Too many requests");
  }

  // 2. Parse request body
  let body;
  if (typeof req.body == "string") {
    try {
      body = JSON.parse(req.body);
    } catch (error) {
      console.error("JSON Parse Error: ", error);
      return res.status(400).send("Invalid JSON");
    }
  } else if (typeof req.body == "object") {
    body = req.body;
  } else {
    return res.status(400).send("Invalid request body");
  }

  // 3. Validate input
  if (
    !body.message ||
    typeof body.message !== "string" ||
    body.message.length > 2000
  ) {
    return res.status(400).send("Invalid input");
  }

  if (!Array.isArray(body.goals)) {
    return res.status(400).send("Invalid goals format");
  }

  if (!Array.isArray(body.sessions)) {
    return res.status(400).send("Invalid sessions format");
  }

  // 4. Sanitize input
  const sanitizedMessage = body.message
    .trim()
    .replace(/<[^>]*>?/gm, "")
    .replace(/```/g, "");

  // 5. Build context
  const goalsSummary = body.goals
    .map(
      (goal) =>
        `- ${goal.title}: ${goal.progress}% (${goal.status || "active"})`,
    )
    .join("\n");

  const sessionsSummary = body.sessions
    .slice(0, 10)
    .map((session) => `- ${session.date}: ${session.duration} minutes`)
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
    return res.status(200).json({ message: aiResponse });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return res.status(504).send("AI Service timeout");
    }

    console.error("Gemini API error:", error);
    return res.status(503).send("AI Service unavailable");
  }
}
