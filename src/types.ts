export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type ConfidenceScore = "High" | "Medium" | "Estimated";

export interface FoodItemBreakdown {
  name: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface LoggedMeal {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mealType: MealType;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidenceScore?: ConfidenceScore;
  confidenceReason?: string;
  honestTip?: string;
  items?: FoodItemBreakdown[];
  photoUrl?: string;
  loggedVia: "ai_text" | "ai_photo" | "database" | "manual";
}

export interface VerifiedFood {
  id: string;
  name: string;
  category: "protein" | "carbs" | "fats" | "produce" | "dairy" | "snacks" | "meals";
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingSizeGrams: number;
  servingName: string; // e.g. "1 medium (118g)", "1 scoop (30g)", "1 cup (150g)"
  verifiedSource: string;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export type SupportedLanguage = "en" | "es" | "fr" | "de" | "ja" | "pt";

export interface UserSettings {
  targets: MacroTargets;
  theme: "dark" | "light" | "system";
  language: SupportedLanguage;
  isSupporter: boolean;
  supporterTier: "free" | "monthly" | "lifetime";
  supporterSince?: string;
}

export interface AiAnalysisResult {
  mealName: string;
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidenceScore: ConfidenceScore;
  confidenceReason: string;
  honestTip?: string;
  items: FoodItemBreakdown[];
}

export interface UserProfileInputs {
  age: number;
  gender: "male" | "female" | "other";
  weightKg: number;
  heightCm: number;
  activityLevel: "sedentary" | "light" | "moderate" | "very_active" | "athlete";
  goal: "fat_loss" | "slow_cut" | "maintenance" | "lean_bulk" | "muscle_gain";
  dietaryPreference: "balanced" | "high_protein" | "keto" | "vegan" | "vegetarian" | "low_carb";
  notes?: string;
}

export interface CalculatedTargetsResult {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  bmr: number;
  tdee: number;
  explanation: string;
  honestAdvice: string;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

