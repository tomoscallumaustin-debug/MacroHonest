import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages = [], currentContext = {}, attachedPhotoBase64, attachedPhotoMime = "image/jpeg" } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server.",
        fallbackReply:
          "I'm currently operating in offline mode because GEMINI_API_KEY is not configured in Vercel settings.",
      });
    }

    const ai = getGenAI();

    const systemInstruction = `You are MacroHonest Coach, a dedicated, knowledgeable, and honest nutrition coach.
Your role:
- Provide supportive, science-backed guidance on hitting daily macros, swapping food ingredients, breaking plateaus, and creating balanced meals.
- Be honest and transparent: if an answer involves estimates or personal variability, state it clearly.
- If the user sends a food image or asks about a plate/nutrition label, provide an honest visual assessment.
- Never promote crash diets, toxic restriction, or proprietary supplement products.
- When the user asks "What should I eat right now?" or asks for meal ideas, ALWAYS check their current day's progress below and propose meal ideas that fit their exact remaining calories, protein, carbs, and fat!

User's Real-Time Daily Progress Context:
- Date: ${currentContext.date || "Today"}
- Targets: ${currentContext.targets?.calories || 2000} kcal (P: ${currentContext.targets?.proteinGrams || 150}g, C: ${currentContext.targets?.carbsGrams || 200}g, F: ${currentContext.targets?.fatGrams || 60}g)
- Consumed So Far: ${currentContext.consumed?.calories || 0} kcal (P: ${currentContext.consumed?.protein || 0}g, C: ${currentContext.consumed?.carbs || 0}g, F: ${currentContext.consumed?.fat || 0}g)
- Remaining: ${currentContext.remaining?.calories || 0} kcal (P: ${currentContext.remaining?.protein || 0}g, C: ${currentContext.remaining?.carbs || 0}g, F: ${currentContext.remaining?.fat || 0}g)
- Logged Meals Today: ${JSON.stringify(currentContext.loggedMealsToday || [])}

Response Guidelines:
- Keep answers snappy, readable, and well-structured for mobile screens (use concise bullet points, bold key numbers).
- Provide practical food recommendations with estimated portions and macros.`;

    const recentMessages = messages.slice(-8);
    const contents = recentMessages.map((msg: { role: string; content: string }, idx: number) => {
      const parts: Array<any> = [];

      if (idx === recentMessages.length - 1 && msg.role === "user" && attachedPhotoBase64) {
        const cleanedPhoto = attachedPhotoBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "").trim();
        if (cleanedPhoto) {
          parts.push({
            inlineData: {
              mimeType: attachedPhotoMime,
              data: cleanedPhoto,
            },
          });
        }
      }

      parts.push({ text: msg.content });

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm here to help with your macros and meals. What's on your mind?";
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Vercel api/coach-chat error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to reach Macro Coach. Please try again.",
      fallbackReply:
        "I'm temporarily having trouble connecting to the AI service, but you can still check your remaining macros on your dashboard! Let me know if you want recipe ideas or macro tips.",
    });
  }
}
