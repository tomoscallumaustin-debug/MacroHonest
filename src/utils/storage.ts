import { LoggedMeal, UserSettings } from "../types";

const MEALS_STORAGE_KEY = "macrohonest_meals_v1";
const SETTINGS_STORAGE_KEY = "macrohonest_settings_v1";

export const DEFAULT_SETTINGS: UserSettings = {
  targets: {
    calories: 2200,
    proteinGrams: 160,
    carbsGrams: 220,
    fatGrams: 65,
  },
  theme: "dark",
  language: "en",
  isSupporter: false,
  supporterTier: "free",
};

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateRelative(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return "Today";
  const [y1, m1, d1] = dateStr.split("-").map(Number);
  const [y2, m2, d2] = todayStr.split("-").map(Number);
  const dateObj = new Date(y1, m1 - 1, d1);
  const todayObj = new Date(y2, m2 - 1, d2);
  const diffDays = Math.round(
    (todayObj.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";

  return dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function offsetDate(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      targets: {
        ...DEFAULT_SETTINGS.targets,
        ...(parsed.targets || {}),
      },
    };
  } catch (e) {
    console.error("Error reading settings from localStorage", e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving settings to localStorage", e);
  }
}

export function loadMeals(): LoggedMeal[] {
  try {
    const raw = localStorage.getItem(MEALS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed initial clean demo meal for today so user immediately sees how MacroHonest works
    const today = getTodayDateString();
    const initialMeals: LoggedMeal[] = [
      {
        id: "demo-breakfast",
        date: today,
        time: "08:15",
        mealType: "breakfast",
        name: "Avocado Toast with Two Poached Eggs",
        calories: 440,
        proteinGrams: 19,
        carbsGrams: 34,
        fatGrams: 26,
        confidenceScore: "High",
        confidenceReason: "Standard whole ingredients: 2 eggs + 1 sourdough slice + 1/2 avocado.",
        honestTip: "Avocado is nutrient-rich with heart-healthy monounsaturated fat.",
        items: [
          {
            name: "Whole Eggs (Poached)",
            portion: "2 large eggs",
            calories: 144,
            proteinGrams: 12.6,
            carbsGrams: 0.8,
            fatGrams: 9.8,
          },
          {
            name: "Artisan Sourdough",
            portion: "1 thick slice (50g)",
            calories: 122,
            proteinGrams: 4.5,
            carbsGrams: 24,
            fatGrams: 0.6,
          },
          {
            name: "Hass Avocado",
            portion: "1/2 medium (100g)",
            calories: 160,
            proteinGrams: 2,
            carbsGrams: 8.5,
            fatGrams: 14.7,
          },
        ],
        loggedVia: "ai_text",
      },
      {
        id: "demo-lunch",
        date: today,
        time: "12:45",
        mealType: "lunch",
        name: "Grilled Chicken & Quinoa Nourish Bowl",
        calories: 565,
        proteinGrams: 48,
        carbsGrams: 52,
        fatGrams: 15,
        confidenceScore: "Medium",
        confidenceReason: "Visible grains & grilled chicken breast; ~1 tbsp olive oil estimated in dressing.",
        honestTip: "Dressing estimation adds ~110 kcal. Adjust oil grams if you dressed it lightly.",
        items: [
          {
            name: "Chicken Breast (Grilled)",
            portion: "150g fillet",
            calories: 248,
            proteinGrams: 46.5,
            carbsGrams: 0,
            fatGrams: 5.4,
          },
          {
            name: "Quinoa (Cooked)",
            portion: "1 cup (185g)",
            calories: 222,
            proteinGrams: 8.1,
            carbsGrams: 39.4,
            fatGrams: 3.5,
          },
          {
            name: "Olive Oil Vinaigrette",
            portion: "1 tbsp (~10g oil)",
            calories: 95,
            proteinGrams: 0,
            carbsGrams: 0.5,
            fatGrams: 10,
          },
        ],
        loggedVia: "ai_photo",
      },
    ];
    saveMeals(initialMeals);
    return initialMeals;
  } catch (e) {
    console.error("Error reading meals from localStorage", e);
    return [];
  }
}

export function saveMeals(meals: LoggedMeal[]): void {
  try {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error("Error writing meals to localStorage", e);
  }
}

export function exportMealsAsJson(meals: LoggedMeal[]): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(meals, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `macrohonest_export_${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportMealsAsCsv(meals: LoggedMeal[]): void {
  const headers = ["ID", "Date", "Time", "MealType", "Name", "Calories", "ProteinGrams", "CarbsGrams", "FatGrams", "Confidence", "LoggedVia"];
  const rows = meals.map((m) => [
    m.id,
    m.date,
    m.time,
    m.mealType,
    `"${m.name.replace(/"/g, '""')}"`,
    m.calories,
    m.proteinGrams,
    m.carbsGrams,
    m.fatGrams,
    m.confidenceScore || "N/A",
    m.loggedVia,
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", encodedUri);
  downloadAnchor.setAttribute("download", `macrohonest_export_${getTodayDateString()}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
