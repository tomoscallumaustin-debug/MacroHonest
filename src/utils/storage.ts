import { LoggedMeal, UserSettings } from "../types";

const MEALS_STORAGE_KEY = "macrohonest_meals_v1";
const SETTINGS_STORAGE_KEY = "macrohonest_settings_v1";
const HYDRATION_STORAGE_KEY = "macrohonest_hydration_v1";

export const DEFAULT_WATER_GOAL_ML = 2500;

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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any legacy dummy/demo meals if previously loaded
        return parsed.filter((m) => !m.id?.startsWith("demo-"));
      }
    }
    // Brand-new users start completely empty (0 calories consumed, full remaining budget)
    return [];
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

export function loadDailyWater(date: string): { amountMl: number; goalMl: number } {
  try {
    const raw = localStorage.getItem(HYDRATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed[date]) {
        return {
          amountMl: Number(parsed[date].amountMl) || 0,
          goalMl: Number(parsed[date].goalMl) || DEFAULT_WATER_GOAL_ML,
        };
      }
    }
    return { amountMl: 0, goalMl: DEFAULT_WATER_GOAL_ML };
  } catch (e) {
    console.error("Error reading hydration from localStorage", e);
    return { amountMl: 0, goalMl: DEFAULT_WATER_GOAL_ML };
  }
}

export function saveDailyWater(date: string, amountMl: number, goalMl: number): void {
  try {
    const raw = localStorage.getItem(HYDRATION_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    existing[date] = {
      amountMl: Math.max(0, Math.round(amountMl)),
      goalMl: Math.max(500, Math.round(goalMl)),
    };
    localStorage.setItem(HYDRATION_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Error saving hydration to localStorage", e);
  }
}

export function clearDailyWater(date?: string): void {
  try {
    if (!date) {
      localStorage.removeItem(HYDRATION_STORAGE_KEY);
      return;
    }
    const raw = localStorage.getItem(HYDRATION_STORAGE_KEY);
    if (raw) {
      const existing = JSON.parse(raw);
      delete existing[date];
      localStorage.setItem(HYDRATION_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (e) {
    console.error("Error clearing hydration", e);
  }
}

const WELCOME_SEEN_KEY = "macrohonest_welcome_seen_v1";

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSeenWelcome(seen: boolean = true): void {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, seen ? "true" : "false");
  } catch (e) {
    console.error("Error saving welcome status", e);
  }
}

