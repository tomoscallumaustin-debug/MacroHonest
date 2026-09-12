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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { text, imageBase64, mimeType = "image/jpeg" } = req.body || {};

    if (!text && !imageBase64) {
      return res.status(400).json({
        error: "Please provide either a meal description text or an image.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server. If deploying to Vercel, set GEMINI_API_KEY or VITE_GEMINI_API_KEY.",
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
3. Always explain the Confidence Reason honestly in 1 concise sentence.
4. Provide a helpful, honest tip (e.g., "Cooking oils add ~120 kcal per tablespoon if sautéed").
5. Return clean JSON matching the specified schema. Round calories and macro grams to nearest whole number or 1 decimal place. Ensure total calories roughly align with: (protein * 4) + (carbs * 4) + (fat * 9).`;

    const parts: Array<any> = [];

    if (imageBase64) {
      const cleanedBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "").trim();
      if (cleanedBase64) {
        parts.push({
          inlineData: {
            mimeType,
            data: cleanedBase64,
          },
        });
      }
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

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Vercel api/analyze-meal error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze meal. Please retry.",
    });
  }
}
