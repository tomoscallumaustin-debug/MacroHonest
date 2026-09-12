import { GoogleGenAI, Type } from "@google/genai";

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

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === "female" ? bmr - 161 : bmr + 5;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const mult = multipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * mult);

  let targetCalories = tdee;
  if (goal === "fat_loss") targetCalories = Math.max(1200, Math.round(tdee - 450));
  else if (goal === "slow_cut") targetCalories = Math.max(1200, Math.round(tdee - 250));
  else if (goal === "lean_bulk") targetCalories = Math.round(tdee + 250);
  else if (goal === "muscle_gain") targetCalories = Math.round(tdee + 400);

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
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const {
    age = 28,
    gender = "other",
    weightKg = 72,
    heightCm = 175,
    activityLevel = "moderate",
    goal = "fat_loss",
    dietaryPreference = "balanced",
    notes = "",
  } = req.body || {};

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
    return res.status(200).json({
      ...fallback,
      source: "scientific_formula_no_key",
    });
  }

  try {
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

Provide a transparent, scientifically honest response. Do not prescribe dangerously low calories. Ensure protein is sufficient for muscle retention (~1.6 to 2.2 g/kg). Calculate realistic grams of protein, carbs, and fat so that: (protein * 4) + (carbs * 4) + (fat * 9) closely matches total calories.`;

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
    return res.status(200).json({
      ...parsed,
      source: "gemini_ai",
    });
  } catch (error: any) {
    console.error("Vercel calculate-targets error:", error);
    return res.status(200).json({
      ...fallback,
      source: "scientific_formula_fallback",
    });
  }
}
