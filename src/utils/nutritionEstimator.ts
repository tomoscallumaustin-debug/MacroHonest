import { AiAnalysisResult, FoodItemBreakdown } from "../types";

interface FoodRule {
  keywords: string[];
  unitName: string;
  defaultQty: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
}

const COMMON_FOOD_RULES: FoodRule[] = [
  {
    keywords: ["egg", "eggs", "poached egg", "boiled egg", "fried egg", "scrambled egg"],
    unitName: "large egg",
    defaultQty: 2,
    caloriesPerUnit: 72,
    proteinPerUnit: 6.3,
    carbsPerUnit: 0.4,
    fatPerUnit: 4.8,
  },
  {
    keywords: ["egg white", "egg whites"],
    unitName: "egg white",
    defaultQty: 3,
    caloriesPerUnit: 17,
    proteinPerUnit: 3.6,
    carbsPerUnit: 0.2,
    fatPerUnit: 0.1,
  },
  {
    keywords: ["toast", "bread", "sourdough", "whole wheat bread", "white bread", "bagel", "slice of bread"],
    unitName: "slice",
    defaultQty: 1,
    caloriesPerUnit: 85,
    proteinPerUnit: 3.2,
    carbsPerUnit: 15.5,
    fatPerUnit: 1.1,
  },
  {
    keywords: ["avocado", "guacamole"],
    unitName: "half avocado (75g)",
    defaultQty: 1,
    caloriesPerUnit: 160,
    proteinPerUnit: 2.0,
    carbsPerUnit: 8.5,
    fatPerUnit: 14.7,
  },
  {
    keywords: ["chicken", "chicken breast", "chicken tender", "grilled chicken"],
    unitName: "100g cooked breast",
    defaultQty: 1.5,
    caloriesPerUnit: 165,
    proteinPerUnit: 31.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 3.6,
  },
  {
    keywords: ["salmon", "salmon fillet", "wild salmon"],
    unitName: "100g cooked salmon",
    defaultQty: 1.5,
    caloriesPerUnit: 206,
    proteinPerUnit: 22.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 12.3,
  },
  {
    keywords: ["tuna", "canned tuna"],
    unitName: "can (120g drained)",
    defaultQty: 1,
    caloriesPerUnit: 130,
    proteinPerUnit: 28.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 1.0,
  },
  {
    keywords: ["steak", "beef", "ground beef", "mince"],
    unitName: "100g cooked",
    defaultQty: 1.5,
    caloriesPerUnit: 245,
    proteinPerUnit: 26.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 15.0,
  },
  {
    keywords: ["turkey", "ground turkey"],
    unitName: "100g cooked",
    defaultQty: 1.5,
    caloriesPerUnit: 175,
    proteinPerUnit: 28.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 6.5,
  },
  {
    keywords: ["tofu", "firm tofu"],
    unitName: "100g tofu",
    defaultQty: 1.5,
    caloriesPerUnit: 140,
    proteinPerUnit: 15.0,
    carbsPerUnit: 3.0,
    fatPerUnit: 8.0,
  },
  {
    keywords: ["rice", "white rice", "brown rice", "jasmine rice", "basmati"],
    unitName: "cup cooked (150g)",
    defaultQty: 1,
    caloriesPerUnit: 205,
    proteinPerUnit: 4.2,
    carbsPerUnit: 44.5,
    fatPerUnit: 0.4,
  },
  {
    keywords: ["quinoa"],
    unitName: "cup cooked (185g)",
    defaultQty: 1,
    caloriesPerUnit: 222,
    proteinPerUnit: 8.1,
    carbsPerUnit: 39.4,
    fatPerUnit: 3.6,
  },
  {
    keywords: ["oats", "oatmeal", "porridge", "rolled oats"],
    unitName: "half cup dry (40g)",
    defaultQty: 1,
    caloriesPerUnit: 150,
    proteinPerUnit: 5.0,
    carbsPerUnit: 27.0,
    fatPerUnit: 2.8,
  },
  {
    keywords: ["pasta", "spaghetti", "noodles"],
    unitName: "cup cooked (140g)",
    defaultQty: 1,
    caloriesPerUnit: 220,
    proteinPerUnit: 8.0,
    carbsPerUnit: 43.0,
    fatPerUnit: 1.3,
  },
  {
    keywords: ["potato", "baked potato", "boiled potato", "mashed potato"],
    unitName: "medium potato (150g)",
    defaultQty: 1,
    caloriesPerUnit: 130,
    proteinPerUnit: 3.0,
    carbsPerUnit: 30.0,
    fatPerUnit: 0.2,
  },
  {
    keywords: ["sweet potato"],
    unitName: "medium sweet potato (130g)",
    defaultQty: 1,
    caloriesPerUnit: 112,
    proteinPerUnit: 2.0,
    carbsPerUnit: 26.0,
    fatPerUnit: 0.1,
  },
  {
    keywords: ["greek yogurt", "yogurt", "skyr"],
    unitName: "cup (200g)",
    defaultQty: 1,
    caloriesPerUnit: 130,
    proteinPerUnit: 20.0,
    carbsPerUnit: 7.0,
    fatPerUnit: 0.5,
  },
  {
    keywords: ["whey", "protein powder", "protein shake", "scoop"],
    unitName: "scoop (30g)",
    defaultQty: 1,
    caloriesPerUnit: 120,
    proteinPerUnit: 24.0,
    carbsPerUnit: 3.0,
    fatPerUnit: 1.5,
  },
  {
    keywords: ["milk", "dairy milk", "whole milk", "skim milk"],
    unitName: "glass (250ml)",
    defaultQty: 1,
    caloriesPerUnit: 125,
    proteinPerUnit: 8.2,
    carbsPerUnit: 12.0,
    fatPerUnit: 4.8,
  },
  {
    keywords: ["almond milk", "oat milk"],
    unitName: "glass (250ml)",
    defaultQty: 1,
    caloriesPerUnit: 60,
    proteinPerUnit: 1.5,
    carbsPerUnit: 9.0,
    fatPerUnit: 2.5,
  },
  {
    keywords: ["olive oil", "oil", "vegetable oil", "canola oil"],
    unitName: "tablespoon (14ml)",
    defaultQty: 1,
    caloriesPerUnit: 119,
    proteinPerUnit: 0.0,
    carbsPerUnit: 0.0,
    fatPerUnit: 13.5,
  },
  {
    keywords: ["butter", "ghee"],
    unitName: "tablespoon (14g)",
    defaultQty: 1,
    caloriesPerUnit: 102,
    proteinPerUnit: 0.1,
    carbsPerUnit: 0.0,
    fatPerUnit: 11.5,
  },
  {
    keywords: ["peanut butter", "almond butter"],
    unitName: "tablespoon (16g)",
    defaultQty: 2,
    caloriesPerUnit: 95,
    proteinPerUnit: 4.0,
    carbsPerUnit: 3.5,
    fatPerUnit: 8.0,
  },
  {
    keywords: ["banana"],
    unitName: "medium banana (118g)",
    defaultQty: 1,
    caloriesPerUnit: 105,
    proteinPerUnit: 1.3,
    carbsPerUnit: 27.0,
    fatPerUnit: 0.3,
  },
  {
    keywords: ["apple"],
    unitName: "medium apple (180g)",
    defaultQty: 1,
    caloriesPerUnit: 95,
    proteinPerUnit: 0.5,
    carbsPerUnit: 25.0,
    fatPerUnit: 0.3,
  },
  {
    keywords: ["berries", "blueberries", "strawberries", "raspberries"],
    unitName: "cup (150g)",
    defaultQty: 1,
    caloriesPerUnit: 65,
    proteinPerUnit: 1.0,
    carbsPerUnit: 15.0,
    fatPerUnit: 0.5,
  },
  {
    keywords: ["broccoli", "spinach", "vegetables", "salad", "greens", "kale", "asparagus"],
    unitName: "serving (100g)",
    defaultQty: 1,
    caloriesPerUnit: 35,
    proteinPerUnit: 2.5,
    carbsPerUnit: 6.0,
    fatPerUnit: 0.4,
  },
  {
    keywords: ["honey", "maple syrup"],
    unitName: "tablespoon (21g)",
    defaultQty: 1,
    caloriesPerUnit: 64,
    proteinPerUnit: 0.1,
    carbsPerUnit: 17.3,
    fatPerUnit: 0.0,
  },
  {
    keywords: ["cheese", "cheddar", "mozzarella", "parmesan"],
    unitName: "slice/portion (30g)",
    defaultQty: 1,
    caloriesPerUnit: 110,
    proteinPerUnit: 7.0,
    carbsPerUnit: 0.5,
    fatPerUnit: 9.0,
  },
];

/**
 * Clean and humanize an AI error message into transparent, user-facing wording.
 */
export function extractCleanErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";

  let msg = typeof error === "string" ? error : error.message || "";

  // Check if string contains raw JSON error
  if (msg.includes('{"error"') || msg.trim().startsWith("{")) {
    try {
      const jsonStart = msg.indexOf("{");
      const jsonEnd = msg.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(msg.slice(jsonStart, jsonEnd + 1));
        if (parsed.error?.message) {
          msg = parsed.error.message;
        } else if (parsed.message) {
          msg = parsed.message;
        }
      }
    } catch {
      // ignore parse failure
    }
  }

  // Handle 503 High Demand / UNAVAILABLE
  if (
    msg.includes("503") ||
    msg.toLowerCase().includes("high demand") ||
    msg.toLowerCase().includes("unavailable") ||
    msg.toLowerCase().includes("overloaded") ||
    error?.status === 503 ||
    error?.code === 503
  ) {
    return "The AI service is temporarily experiencing high demand. Please try again in a few moments, or use instant nutritional estimate.";
  }

  // Handle 429 Rate Limit / Quota
  if (
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate limit") ||
    error?.status === 429 ||
    error?.code === 429
  ) {
    return "AI rate limit reached. Please wait a moment and try again.";
  }

  // Handle API Key issues
  if (
    msg.includes("GEMINI_API_KEY") ||
    msg.includes("API key") ||
    msg.toLowerCase().includes("unauthenticated") ||
    error?.status === 401 ||
    error?.status === 403
  ) {
    return "Gemini API key is not configured or is invalid on the server.";
  }

  return msg || "Failed to analyze meal. You can adjust details manually.";
}

/**
 * Generate an instant nutritional estimate from text if AI service is temporarily unavailable.
 */
export function estimateMealNutrientsHeuristically(text: string): AiAnalysisResult {
  const normalized = text.toLowerCase();
  const matchedItems: FoodItemBreakdown[] = [];

  for (const rule of COMMON_FOOD_RULES) {
    for (const keyword of rule.keywords) {
      // Regex check for keyword with word boundaries
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(normalized)) {
        // Try to parse quantity before keyword (e.g. "2 eggs", "150g chicken", "3 slices")
        let qty = rule.defaultQty;
        const qtyMatch = normalized.match(
          new RegExp(`(\\d+(\\.\\d+)?)\\s*(?:g|grams|oz|slices?|cups?|tbsp|scoops?)?\\s*${keyword}`, "i")
        );
        if (qtyMatch && Number(qtyMatch[1]) > 0) {
          const val = Number(qtyMatch[1]);
          // If in grams (e.g. 150g chicken) and rule is per 100g
          if (rule.unitName.includes("100g") && val > 20) {
            qty = val / 100;
          } else {
            qty = val;
          }
        }

        const calories = Math.round(rule.caloriesPerUnit * qty);
        const protein = Math.round(rule.proteinPerUnit * qty * 10) / 10;
        const carbs = Math.round(rule.carbsPerUnit * qty * 10) / 10;
        const fat = Math.round(rule.fatPerUnit * qty * 10) / 10;

        matchedItems.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          portion: `${qty > 1 ? qty : ""} ${rule.unitName}`.trim(),
          calories,
          proteinGrams: protein,
          carbsGrams: carbs,
          fatGrams: fat,
        });
        break; // matched this rule, avoid double-adding same rule
      }
    }
  }

  // If no specific recognized items found, create a sensible balanced baseline
  if (matchedItems.length === 0) {
    matchedItems.push({
      name: text.trim() || "Mixed Meal",
      portion: "Standard single serving",
      calories: 450,
      proteinGrams: 28,
      carbsGrams: 42,
      fatGrams: 16,
    });
  }

  const totalCalories = matchedItems.reduce((sum, item) => sum + item.calories, 0);
  const proteinGrams = Math.round(matchedItems.reduce((sum, item) => sum + item.proteinGrams, 0));
  const carbsGrams = Math.round(matchedItems.reduce((sum, item) => sum + item.carbsGrams, 0));
  const fatGrams = Math.round(matchedItems.reduce((sum, item) => sum + item.fatGrams, 0));

  // Derive a clean meal name
  const cleanName =
    text.trim().length > 0 && text.trim().length <= 40
      ? text.trim()
      : matchedItems.map((i) => i.name).slice(0, 2).join(" & ") || "Nutritional Meal";

  return {
    mealName: cleanName,
    totalCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    confidenceScore: "Estimated" as const,
    confidenceReason:
      "Calculated from standard USDA nutritional data baseline due to temporary AI cloud capacity.",
    honestTip:
      "Nutrient values are honest standard baselines. Adjust portions or oil estimates as needed.",
    items: matchedItems,
  };
}
