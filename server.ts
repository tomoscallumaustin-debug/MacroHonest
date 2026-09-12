import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser with support for base64 image uploads (up to 15MB)
app.use(express.json({ limit: "15mb" }));

// Lazy initialize Google GenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Deterministic Mifflin-St Jeor calculation fallback
function calculateFallbackTargets(data: {
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
}) {
  const { age, gender, weightKg, heightCm, activityLevel, goal, dietaryPreference } = data;

  // BMR via Mifflin-St Jeor
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === "female" ? bmr - 161 : bmr + 5;

  // Activity multiplier
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
    explanation: `Calculated from Mifflin-St Jeor BMR (~${Math.round(bmr)} kcal) and activity level, adjusted for ${goal.replace("_", " ")} with ~${proteinPerKg}g protein per kg.`,
    honestAdvice: "Targets are honest starting baselines. Monitor your weekly average weight and adjust by ±100-150 kcal if progress stalls for 2+ weeks.",
  };
}

// AI Calorie & Macro Target Calculator
app.post("/api/calculate-targets", async (req, res) => {
  try {
    const {
      age = 28,
      gender = "other",
      weightKg = 72,
      heightCm = 175,
      activityLevel = "moderate",
      goal = "fat_loss",
      dietaryPreference = "balanced",
      notes = "",
    } = req.body;

    const fallback = calculateFallbackTargets({
      age: Number(age),
      gender: String(gender),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      activityLevel: String(activityLevel),
      goal: String(goal),
      dietaryPreference: String(dietaryPreference),
    });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        ...fallback,
        source: "scientific_formula",
      });
    }

    const ai = getGenAI();
    const prompt = `Calculate personalized daily calorie and macro targets (Protein, Carbs, Fats) for a user with these profile metrics:
- Age: ${age}
- Biological Sex: ${gender}
- Weight: ${weightKg} kg
- Height: ${heightCm} cm
- Activity Level: ${activityLevel}
- Primary Goal: ${goal}
- Dietary Preference: ${dietaryPreference}
- Additional Notes: ${notes || "None"}

Scientific reference:
- Baseline BMR: ~${fallback.bmr} kcal
- Baseline TDEE: ~${fallback.tdee} kcal

Provide a transparent, scientifically honest response. Do NOT prescribe dangerously low calories (minimum 1200 kcal for women, 1500 kcal for men unless medically supervised). Ensure protein is sufficient for muscle retention (~1.6 to 2.2 g/kg depending on training and diet). Calculate realistic grams of protein, carbs, and fat so that: (protein * 4) + (carbs * 4) + (fat * 9) closely matches total calories.`;

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
            calories: { type: Type.NUMBER, description: "Daily target calories (kcal)" },
            proteinGrams: { type: Type.NUMBER, description: "Daily target protein in grams" },
            carbsGrams: { type: Type.NUMBER, description: "Daily target carbohydrates in grams" },
            fatGrams: { type: Type.NUMBER, description: "Daily target fat in grams" },
            bmr: { type: Type.NUMBER, description: "Basal Metabolic Rate in kcal" },
            tdee: { type: Type.NUMBER, description: "Total Daily Energy Expenditure in kcal" },
            explanation: { type: Type.STRING, description: "Clear explanation of how calories and macros were chosen" },
            honestAdvice: { type: Type.STRING, description: "Honest practical tip on adherence and weight tracking" },
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
    return res.json({
      ...parsed,
      source: "gemini_ai",
    });
  } catch (error: any) {
    console.error("Target calculation error:", error);
    // Graceful fallback to formula
    const fallback = calculateFallbackTargets({
      age: Number(req.body.age || 28),
      gender: String(req.body.gender || "other"),
      weightKg: Number(req.body.weightKg || 72),
      heightCm: Number(req.body.heightCm || 175),
      activityLevel: String(req.body.activityLevel || "moderate"),
      goal: String(req.body.goal || "fat_loss"),
      dietaryPreference: String(req.body.dietaryPreference || "balanced"),
    });
    return res.json({
      ...fallback,
      source: "scientific_formula_fallback",
    });
  }
});

// AI Macro Coach Chat endpoint
app.post("/api/coach-chat", async (req, res) => {
  try {
    const { messages = [], currentContext = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are MacroHonest Coach, a dedicated, knowledgeable, and honest nutrition coach.
Your role:
- Provide supportive, science-backed guidance on hitting daily macros, swapping food ingredients, breaking plateaus, and creating balanced meals.
- Be honest and transparent: if an answer involves estimates or personal variability, state it clearly.
- Never promote crash diets, toxic restriction, or proprietary supplement products.
- When the user asks "What should I eat right now?" or asks for meal ideas, ALWAYS check their current day's progress below and propose meal ideas that fit their exact remaining calories, protein, carbs, and fat!

User's Real-Time Daily Progress Context:
- Date: ${currentContext.date || "Today"}
- Targets: ${currentContext.targets?.calories || 2000} kcal (P: ${currentContext.targets?.proteinGrams || 150}g, C: ${currentContext.targets?.carbsGrams || 200}g, F: ${currentContext.targets?.fatGrams || 60}g)
- Consumed So Far: ${currentContext.consumed?.calories || 0} kcal (P: ${currentContext.consumed?.protein || 0}g, C: ${currentContext.consumed?.carbs || 0}g, F: ${currentContext.consumed?.fat || 0}g)
- Remaining: ${currentContext.remaining?.calories || 0} kcal (P: ${currentContext.remaining?.protein || 0}g, C: ${currentContext.remaining?.carbs || 0}g, F: ${currentContext.remaining?.fat || 0}g)
- Logged Meals Today: ${JSON.stringify(currentContext.loggedMealsToday || [])}
- Dietary Style: ${currentContext.dietaryPreference || "Balanced"}
- Primary Goal: ${currentContext.goal || "Healthy nutrition"}

Response Guidelines:
- Keep answers snappy, readable, and well-structured for mobile screens (use concise bullet points, bold key numbers).
- Provide practical food recommendations with estimated portions and macros.`;

    // Map conversation turns into Gemini format
    // Keep last 10 messages for context
    const recentMessages = messages.slice(-10);
    const contents = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm here to help with your macros and meals. What's on your mind?";
    return res.json({ reply });
  } catch (error: any) {
    console.error("AI Coach Chat error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to reach Macro Coach. Please try again.",
      fallbackReply:
        "I'm temporarily having trouble connecting to the AI service, but you can still check your remaining macros on your dashboard! Let me know if you want recipe ideas or macro tips.",
    });
  }
});

// AI Meal Analysis endpoint
app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { text, imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({
        error: "Please provide either a meal description text or an image.",
      });
    }

    const ai = getGenAI();

    const systemInstruction = `You are MacroHonest AI, an honest, transparent, and accurate nutritional analysis assistant.
Your goal is to provide realistic, scientifically grounded calorie and macronutrient estimates (Calories, Protein in grams, Carbs in grams, Fat in grams).

Crucial Honesty Guidelines:
1. Transparency over false certainty: Break down each identified food item or component (e.g. cooking oil, dressing, bread, protein).
2. Assign a transparent Confidence Score:
   - "High": Precise quantities or standard packaged/whole foods (e.g., "2 large eggs and 1 slice whole wheat bread", "150g grilled chicken breast").
   - "Medium": Mixed dish with visible ingredients but uncertain exact portions or preparation methods (e.g., "chicken burrito bowl with rice and guacamole").
   - "Estimated": Unspecified cooking oils, heavy restaurant sauces, indistinct stew, or approximate photo angle where density/depth is uncertain.
3. Always explain the Confidence Reason honestly in 1 concise sentence (e.g., "High confidence because ingredients and weights are clearly defined" or "Estimated because restaurant cooking oil and dressing portions cannot be verified visually").
4. Provide a helpful, honest tip (e.g., "Cooking oils add ~120 kcal per tablespoon if sautéed").
5. Return clean JSON matching the specified schema. Round calories and macro grams to nearest whole number or 1 decimal place. Ensure total calories roughly align with: (protein * 4) + (carbs * 4) + (fat * 9).`;

    const parts: Array<any> = [];

    if (imageBase64) {
      // Clean base64 header if included
      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanedBase64,
        },
      });
    }

    const promptText = text
      ? `Analyze this meal: "${text}". Provide accurate calories and macros breakdown.`
      : "Analyze this food image. Identify all visible ingredients, estimate realistic serving weights/volumes, calories, and macros breakdown.";

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: {
              type: Type.STRING,
              description: "A concise, descriptive name for the overall meal",
            },
            totalCalories: {
              type: Type.NUMBER,
              description: "Total estimated calories (kcal)",
            },
            proteinGrams: {
              type: Type.NUMBER,
              description: "Total protein in grams",
            },
            carbsGrams: {
              type: Type.NUMBER,
              description: "Total carbohydrates in grams",
            },
            fatGrams: {
              type: Type.NUMBER,
              description: "Total fat in grams",
            },
            confidenceScore: {
              type: Type.STRING,
              description: "Confidence rating: 'High', 'Medium', or 'Estimated'",
            },
            confidenceReason: {
              type: Type.STRING,
              description: "Clear honest explanation of why this confidence level was assigned",
            },
            honestTip: {
              type: Type.STRING,
              description: "A brief practical nutritional note or hidden calorie caveat",
            },
            items: {
              type: Type.ARRAY,
              description: "List of individual food components analyzed",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of food component" },
                  portion: { type: Type.STRING, description: "Estimated portion (e.g., '2 large eggs', '1 cup (150g)')" },
                  calories: { type: Type.NUMBER, description: "Calories for this component" },
                  proteinGrams: { type: Type.NUMBER, description: "Protein grams" },
                  carbsGrams: { type: Type.NUMBER, description: "Carbs grams" },
                  fatGrams: { type: Type.NUMBER, description: "Fat grams" },
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

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini model.");
    }

    const parsedData = JSON.parse(responseText.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing meal with Gemini:", error);

    // Provide friendly fallback if API key is missing or quota/network error
    const isApiKeyMissing =
      !process.env.GEMINI_API_KEY ||
      error?.message?.includes("GEMINI_API_KEY") ||
      error?.message?.includes("API key");

    return res.status(500).json({
      error: isApiKeyMissing
        ? "Gemini API key is not set or valid. You can still log manually or search our verified food database."
        : error?.message || "Failed to analyze meal. Please adjust manually.",
      canFallbackManual: true,
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MacroHonest server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
