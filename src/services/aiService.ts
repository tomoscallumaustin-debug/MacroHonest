import { GoogleGenAI, Type } from "@google/genai";
import {
  AiAnalysisResult,
  CalculatedTargetsResult,
  ChatMessage,
  ConfidenceScore,
  UserProfileInputs,
} from "../types";
import { extractCleanErrorMessage } from "../utils/nutritionEstimator";

/**
 * Clean base64 and extract MIME type from a data URI or raw base64 string.
 */
export function cleanBase64AndMime(
  dataUriOrBase64?: string,
  defaultMime = "image/jpeg"
): { mimeType: string; cleanBase64: string } | null {
  if (!dataUriOrBase64) return null;

  const dataUriMatch = dataUriOrBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
  if (dataUriMatch) {
    return {
      mimeType: dataUriMatch[1] || defaultMime,
      cleanBase64: dataUriMatch[2].trim(),
    };
  }

  return {
    mimeType: defaultMime,
    cleanBase64: dataUriOrBase64.trim(),
  };
}

/**
 * Get client-side Gemini API key if configured (e.g. for Vercel static deployments).
 */
export function getViteGeminiApiKey(): string | undefined {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0 && envKey !== "MY_GEMINI_API_KEY") {
    return envKey.trim();
  }
  if (typeof window !== "undefined" && (window as any).__VITE_GEMINI_API_KEY) {
    return (window as any).__VITE_GEMINI_API_KEY;
  }
  return undefined;
}

/**
 * Check whether a client-side or server key might be present.
 */
export function hasClientGeminiKey(): boolean {
  return !!getViteGeminiApiKey();
}

/**
 * Lazy client-side GoogleGenAI singleton for static deployments.
 * Security Note: When using client-side keys on static hosts like Vercel,
 * VITE_GEMINI_API_KEY is bundled into the client build.
 */
let clientGenAIInstance: GoogleGenAI | null = null;
function getClientGenAI(apiKey: string): GoogleGenAI {
  if (!clientGenAIInstance) {
    clientGenAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return clientGenAIInstance;
}

/**
 * Safe JSON fetch wrapper that guards against HTML responses (e.g. Vercel 404 or SPA fallback)
 * preventing "Unexpected token '<', '<!DOCTYPE...' is not valid JSON" crashes.
 */
export async function safeFetchJson<T>(
  url: string,
  options: RequestInit
): Promise<{
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlOrMissingBackend?: boolean;
}> {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();
    const trimmed = rawText.trim();

    // Check if the response is HTML (e.g. Vercel 404 page or index.html rewrite)
    const isHtml =
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("<!doctype") ||
      contentType.includes("text/html");

    if (isHtml || (!contentType.includes("application/json") && !trimmed.startsWith("{") && !trimmed.startsWith("["))) {
      return {
        ok: false,
        status: response.status,
        error: `Server endpoint '${url}' returned non-JSON HTML (status ${response.status}). Backend route is not available on this host.`,
        isHtmlOrMissingBackend: true,
      };
    }

    try {
      const parsed = JSON.parse(trimmed) as T;
      if (!response.ok) {
        const rawMessage =
          (parsed as any)?.error || `Server responded with status ${response.status}`;
        const cleanMessage = extractCleanErrorMessage(rawMessage);
        return { ok: false, status: response.status, data: parsed, error: cleanMessage };
      }
      return { ok: true, status: response.status, data: parsed };
    } catch (parseErr: any) {
      return {
        ok: false,
        status: response.status,
        error: "Failed to parse JSON response from server.",
        isHtmlOrMissingBackend: true,
      };
    }
  } catch (networkErr: any) {
    return {
      ok: false,
      status: 0,
      error: networkErr?.message || "Network error or connection blocked.",
      isHtmlOrMissingBackend: true,
    };
  }
}

/**
 * Deterministic Mifflin-St Jeor calculation fallback (100% offline & keyless).
 */
export function calculateFallbackTargets(data: {
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
}): CalculatedTargetsResult {
  const { age, gender, weightKg, heightCm, activityLevel, goal, dietaryPreference } = data;

  // BMR via Mifflin-St Jeor
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === "female" ? bmr - 161 : bmr + 5;

  // Activity multipliers
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const mult = multipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * mult);

  // Goal adjustment
  let targetCalories = tdee;
  if (goal === "fat_loss") targetCalories = Math.max(1200, Math.round(tdee - 450));
  else if (goal === "slow_cut") targetCalories = Math.max(1200, Math.round(tdee - 250));
  else if (goal === "lean_bulk") targetCalories = Math.round(tdee + 250);
  else if (goal === "muscle_gain") targetCalories = Math.round(tdee + 400);

  // Macro distribution
  let proteinPerKg = 1.8;
  let fatPct = 0.25;

  if (dietaryPreference === "keto") {
    fatPct = 0.65;
    proteinPerKg = 1.7;
  } else if (dietaryPreference === "high_protein") {
    proteinPerKg = 2.2;
    fatPct = 0.22;
  } else if (dietaryPreference === "vegan" || dietaryPreference === "vegetarian") {
    proteinPerKg = 1.8;
    fatPct = 0.25;
  }

  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinGrams * 4;
  const fatCals = targetCalories * fatPct;
  const fatGrams = Math.round(fatCals / 9);
  const remainingCalsForCarbs = Math.max(0, targetCalories - proteinCals - fatGrams * 9);
  const carbsGrams = Math.round(remainingCalsForCarbs / 4);

  return {
    calories: targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    bmr: Math.round(bmr),
    tdee,
    explanation: `Calculated from Mifflin-St Jeor formula (BMR ~${Math.round(bmr)} kcal, TDEE ~${tdee} kcal), adjusted for ${goal.replace("_", " ")} with ~${proteinPerKg}g protein per kg.`,
    honestAdvice: "These targets are honest baselines. Track consistency for 2 weeks; adjust by ±100 kcal if your weekly average weight doesn't move as expected.",
    source: "scientific_formula",
  };
}

/**
 * Perform Meal Analysis with Dual Routing:
 * 1. Attempts the backend /api/analyze-meal route.
 * 2. If backend is missing or returns HTML (Vercel deployment), falls back to client-side Gemini with VITE_GEMINI_API_KEY.
 * 3. If neither is available, produces a clean, non-crashing descriptive error with manual fallback option.
 */
export async function analyzeMeal(params: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<AiAnalysisResult> {
  const { text, imageBase64, mimeType = "image/jpeg" } = params;

  if (!text && !imageBase64) {
    throw new Error("Please provide either a meal description or a food photo.");
  }

  // 1. Try server endpoint first
  const serverResult = await safeFetchJson<AiAnalysisResult>("/api/analyze-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text?.trim() || undefined,
      imageBase64: imageBase64 || undefined,
      mimeType,
    }),
  });

  if (serverResult.ok && serverResult.data) {
    return serverResult.data;
  }

  // 2. If server failed due to missing backend/HTML on Vercel, try client-side Gemini
  const clientKey = getViteGeminiApiKey();

  if (clientKey) {
    try {
      const ai = getClientGenAI(clientKey);

      const systemInstruction = `You are MacroHonest AI, an honest, transparent, and accurate nutritional analysis assistant.
Provide realistic, scientifically grounded calorie and macronutrient estimates (Calories, Protein in grams, Carbs in grams, Fat in grams).

Crucial Guidelines:
1. Transparency over false certainty: Break down identified food items (cooking oil, sauces, protein, carbs).
2. Assign a Confidence Score:
   - "High": Precise quantities or standard whole foods.
   - "Medium": Mixed dish with visible ingredients but uncertain exact portions.
   - "Estimated": Hidden restaurant oils, sauces, indistinct casserole, or photo angle where depth is uncertain.
3. Explain the Confidence Reason honestly in 1 concise sentence.
4. Return strict JSON matching the schema. Total calories must roughly match: (protein * 4) + (carbs * 4) + (fat * 9).`;

      const parts: Array<any> = [];

      // Process image properly
      const processedImage = cleanBase64AndMime(imageBase64, mimeType);
      if (processedImage && processedImage.cleanBase64.length > 0) {
        parts.push({
          inlineData: {
            mimeType: processedImage.mimeType,
            data: processedImage.cleanBase64,
          },
        });
      }

      const promptText = text
        ? `Analyze this meal: "${text}". Estimate realistic portion sizes, calories, and macronutrient grams.`
        : "Analyze this food photo. Identify all visible ingredients, estimate realistic weights, calories, and macros.";

      parts.push({ text: promptText });

      const modelsToTry = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let lastClientErr: any = null;
      let rawJson = "{}";

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  mealName: { type: Type.STRING, description: "Descriptive name for the meal" },
                  totalCalories: { type: Type.NUMBER, description: "Total estimated calories (kcal)" },
                  proteinGrams: { type: Type.NUMBER, description: "Total protein in grams" },
                  carbsGrams: { type: Type.NUMBER, description: "Total carbs in grams" },
                  fatGrams: { type: Type.NUMBER, description: "Total fat in grams" },
                  confidenceScore: { type: Type.STRING, description: "High, Medium, or Estimated" },
                  confidenceReason: { type: Type.STRING, description: "Brief honest rationale" },
                  honestTip: { type: Type.STRING, description: "Practical nutritional note" },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        portion: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        proteinGrams: { type: Type.NUMBER },
                        carbsGrams: { type: Type.NUMBER },
                        fatGrams: { type: Type.NUMBER },
                      },
                      required: ["name", "portion", "calories", "proteinGrams", "carbsGrams", "fatGrams"],
                    },
                  },
                },
                required: [
                  "mealName",
                  "totalCalories",
                  "proteinGrams",
                  "carbsGrams",
                  "fatGrams",
                  "confidenceScore",
                  "confidenceReason",
                  "items",
                ],
              },
            },
          });
          rawJson = response.text?.trim() || "{}";
          break;
        } catch (mErr: any) {
          lastClientErr = mErr;
          console.warn(`[Client Gemini] ${model} failed, attempting next model if available...`);
        }
      }

      if (rawJson === "{}" && lastClientErr) {
        throw lastClientErr;
      }

      const parsed = JSON.parse(rawJson) as AiAnalysisResult;
      return parsed;
    } catch (clientAiErr: any) {
      console.error("Client-side Gemini analysis error:", clientAiErr);
      throw new Error(extractCleanErrorMessage(clientAiErr));
    }
  }

  // 3. No server backend and no client key configured
  const errorMessage = serverResult.isHtmlOrMissingBackend
    ? "AI service is unavailable. When deploying to Vercel, please add VITE_GEMINI_API_KEY to your Vercel Environment Variables. You can also switch to manual entry below."
    : extractCleanErrorMessage(serverResult.error || "Analysis failed. Please check your network connection or enter details manually.");

  throw new Error(errorMessage);
}

/**
 * AI Macro Coach Chat with Dual Routing & Rich Real-Time Context
 */
export async function sendCoachChat(params: {
  messages: ChatMessage[];
  currentContext: any;
  attachedPhotoBase64?: string;
  attachedPhotoMime?: string;
}): Promise<{ reply: string; source: "server" | "client_ai" | "offline_coach" }> {
  const { messages, currentContext, attachedPhotoBase64, attachedPhotoMime = "image/jpeg" } = params;

  // 1. Try server endpoint first
  const serverResult = await safeFetchJson<{ reply?: string; fallbackReply?: string }>(
    "/api/coach-chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        currentContext,
        attachedPhotoBase64,
        attachedPhotoMime,
      }),
    }
  );

  if (serverResult.ok && serverResult.data?.reply) {
    return { reply: serverResult.data.reply, source: "server" };
  }

  // 2. If server failed or missing on Vercel, try client-side Gemini
  const clientKey = getViteGeminiApiKey();

  if (clientKey) {
    try {
      const ai = getClientGenAI(clientKey);

      const systemInstruction = `You are MacroHonest Coach, a dedicated, knowledgeable, and honest nutrition coach.
Your role:
- Provide supportive, science-backed guidance on hitting daily macros, swapping food ingredients, breaking plateaus, and creating balanced meals.
- Be honest and transparent: if an answer involves estimates or personal variability, state it clearly.
- If the user attaches a food image or asks about a plate/nutrition label, provide an honest visual assessment.
- When the user asks "What should I eat right now?" or asks for meal ideas, ALWAYS check their real-time progress below and propose meal ideas that fit their exact remaining calories and macros!

User's Real-Time Daily Progress Context:
- Date: ${currentContext.date || "Today"}
- Targets: ${currentContext.targets?.calories || 2000} kcal (P: ${currentContext.targets?.proteinGrams || 150}g, C: ${currentContext.targets?.carbsGrams || 200}g, F: ${currentContext.targets?.fatGrams || 60}g)
- Consumed So Far: ${currentContext.consumed?.calories || 0} kcal (P: ${currentContext.consumed?.protein || 0}g, C: ${currentContext.consumed?.carbs || 0}g, F: ${currentContext.consumed?.fat || 0}g)
- Remaining: ${currentContext.remaining?.calories || 0} kcal (P: ${currentContext.remaining?.protein || 0}g, C: ${currentContext.remaining?.carbs || 0}g, F: ${currentContext.remaining?.fat || 0}g)
- Logged Meals Today: ${JSON.stringify(currentContext.loggedMealsToday || [])}

Formatting:
- Keep answers snappy, readable, and well-structured for mobile screens (use concise bullet points, bold key numbers).`;

      // Map conversation history into Gemini format
      const recentMessages = messages.slice(-8);
      const contents: Array<any> = recentMessages.map((msg, index) => {
        const isLatestUserMsg = index === recentMessages.length - 1 && msg.role === "user";
        const parts: Array<any> = [];

        // If there's an attached photo on the latest user message, include it
        if (isLatestUserMsg && attachedPhotoBase64) {
          const processedImage = cleanBase64AndMime(attachedPhotoBase64, attachedPhotoMime);
          if (processedImage && processedImage.cleanBase64.length > 0) {
            parts.push({
              inlineData: {
                mimeType: processedImage.mimeType,
                data: processedImage.cleanBase64,
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

      const reply = response.text || "I'm here to support your macros and meals. What's on your mind?";
      return { reply, source: "client_ai" };
    } catch (clientChatErr: any) {
      console.error("Client-side Coach error:", clientChatErr);
    }
  }

  // 3. Graceful Offline Coach Response (Calculates directly from current remaining macros)
  const remaining = currentContext.remaining || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";

  let offlineReply = `Here is your honest status for today:\n\n` +
    `• **Remaining:** **${remaining.calories} kcal** (Protein: **${remaining.protein}g**, Carbs: **${remaining.carbs}g**, Fat: **${remaining.fat}g**)\n\n`;

  if (lastUserMsg.includes("eat") || lastUserMsg.includes("meal") || lastUserMsg.includes("snack")) {
    offlineReply += `**Macro-friendly suggestions to hit your targets:**\n` +
      `• **High Protein:** 150g 0% Greek yogurt + scoop whey (~180 kcal, 32g protein)\n` +
      `• **Balanced:** 120g grilled chicken breast + steamed broccoli & sweet potato (~320 kcal, 35g protein, 28g carbs)\n` +
      `• **Quick Snack:** 3 hard-boiled egg whites + 1 whole egg (~120 kcal, 16g protein, 5g fat)\n\n`;
  } else if (lastUserMsg.includes("plateau") || lastUserMsg.includes("weight") || lastUserMsg.includes("stuck")) {
    offlineReply += `**Honest Plateau Troubleshooting:**\n` +
      `1. **Water Retention:** New workouts, sodium, or stress cause temporary 1-2kg water spikes that mask fat loss.\n` +
      `2. **Unmeasured Oils:** 1 tablespoon of cooking oil adds ~120 kcal unnoticed.\n` +
      `3. **Weekly Averages:** Compare 7-day median weights, not single daily weigh-ins.\n\n`;
  } else {
    offlineReply += `For best results, prioritize hitting your daily **protein target (${currentContext.targets?.proteinGrams || 150}g)** to preserve lean tissue, and stay within ±100 kcal of your daily energy goal.\n\n`;
  }

  if (!clientKey) {
    offlineReply += `*(Note: Running in offline coach mode. When deployed to Vercel, configure **VITE_GEMINI_API_KEY** in your Vercel Project Settings to unlock real-time Gemini AI conversations!)*`;
  }

  return { reply: offlineReply, source: "offline_coach" };
}

/**
 * AI Calorie & Macro Target Calculator with Dual Routing
 */
export async function calculateTargets(inputs: UserProfileInputs): Promise<CalculatedTargetsResult> {
  const fallback = calculateFallbackTargets({
    age: inputs.age,
    gender: inputs.gender,
    weightKg: inputs.weightKg,
    heightCm: inputs.heightCm,
    activityLevel: inputs.activityLevel,
    goal: inputs.goal,
    dietaryPreference: inputs.dietaryPreference,
  });

  // 1. Try server endpoint
  const serverResult = await safeFetchJson<CalculatedTargetsResult>("/api/calculate-targets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });

  if (serverResult.ok && serverResult.data) {
    return serverResult.data;
  }

  // 2. Try client-side Gemini if VITE_GEMINI_API_KEY is available
  const clientKey = getViteGeminiApiKey();

  if (clientKey) {
    try {
      const ai = getClientGenAI(clientKey);

      const prompt = `Calculate personalized daily calorie and macro targets (Protein, Carbs, Fats) for a user with these profile metrics:
- Age: ${inputs.age}
- Biological Sex: ${inputs.gender}
- Weight: ${inputs.weightKg} kg
- Height: ${inputs.heightCm} cm
- Activity Level: ${inputs.activityLevel}
- Primary Goal: ${inputs.goal}
- Dietary Preference: ${inputs.dietaryPreference}
- Additional Notes: ${inputs.notes || "None"}

Scientific reference:
- Baseline BMR: ~${fallback.bmr} kcal
- Baseline TDEE: ~${fallback.tdee} kcal

Provide a transparent, scientifically honest response. Do not prescribe dangerously low calories (minimum 1200 kcal for females, 1500 kcal for males). Calculate realistic grams of protein, carbs, and fat so that: (protein * 4) + (carbs * 4) + (fat * 9) closely matches total calories.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are MacroHonest Nutrition Science Engine. Return strict JSON with exact recommended calories, protein grams, carbs grams, fat grams, bmr, tdee, an honest explanation, and an honest advice tip.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              proteinGrams: { type: Type.NUMBER },
              carbsGrams: { type: Type.NUMBER },
              fatGrams: { type: Type.NUMBER },
              bmr: { type: Type.NUMBER },
              tdee: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              honestAdvice: { type: Type.STRING },
            },
            required: [
              "calories",
              "proteinGrams",
              "carbsGrams",
              "fatGrams",
              "bmr",
              "tdee",
              "explanation",
              "honestAdvice",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return {
        ...parsed,
        source: "client_gemini_ai",
      };
    } catch (calcErr: any) {
      console.error("Client Gemini target calculation error:", calcErr);
    }
  }

  // 3. Fallback directly to Mifflin-St Jeor formula (never crashes!)
  return fallback;
}
