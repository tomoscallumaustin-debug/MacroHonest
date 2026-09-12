import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DailyRing } from "./components/DailyRing";
import { AiMealLogger } from "./components/AiMealLogger";
import { MealList } from "./components/MealList";
import { FoodSearchModal } from "./components/FoodSearchModal";
import { HonestPricingModal } from "./components/HonestPricingModal";
import { SettingsModal } from "./components/SettingsModal";
import { CalorieGuideModal } from "./components/CalorieGuideModal";
import { AiCoachChat } from "./components/AiCoachChat";
import { LoggedMeal, MacroTargets, SupportedLanguage, UserSettings } from "./types";
import { TRANSLATIONS } from "./utils/translations";
import {
  exportMealsAsCsv,
  exportMealsAsJson,
  getTodayDateString,
  loadMeals,
  loadSettings,
  saveMeals,
  saveSettings,
} from "./utils/storage";
import {
  Search,
  Sparkles,
  Plus,
  ShieldCheck,
  Calculator,
  Bot,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export default function App() {
  const [meals, setMeals] = useState<LoggedMeal[]>(() => loadMeals());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  // Persist meals whenever updated
  useEffect(() => {
    saveMeals(meals);
  }, [meals]);

  // Persist settings whenever updated
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle Theme (dark/light/system)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (settings.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  // Add new logged meal
  const handleMealLogged = (newMeal: LoggedMeal) => {
    setMeals((prev) => [newMeal, ...prev]);
  };

  // Delete logged meal
  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  // Apply new targets from AI Guide
  const handleApplyTargets = (newTargets: MacroTargets) => {
    setSettings((prev) => ({
      ...prev,
      targets: newTargets,
    }));
  };

  // Filter meals for the currently selected date
  const dayMeals = meals.filter((m) => m.date === selectedDate);

  // Reset meals
  const handleResetMeals = () => {
    if (window.confirm(t.deleteConfirm)) {
      setMeals([]);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Sticky App Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCoach={() => setIsCoachOpen(true)}
        onLanguageChange={(lang: SupportedLanguage) =>
          setSettings((prev) => ({ ...prev, language: lang }))
        }
      />

      {/* Main Content Container (Mobile-First Container) */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-24">
        {/* Anti-Bloat Manifesto Banner (Honest Guarantee) */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-medium">
              Zero Ads • Local-First • Transparent AI
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPricingOpen(true)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
          >
            No Traps
          </button>
        </div>

        {/* AI Quick Assistant Row (Guide & Coach Launchers) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Calorie Guide Card */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 text-left transition flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-100 block leading-tight">
                  Calorie Guide
                </span>
                <span className="text-[10px] text-zinc-400">
                  Auto-set targets
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition" />
          </button>

          {/* AI Coach Card */}
          <button
            type="button"
            onClick={() => setIsCoachOpen(true)}
            className="p-2.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 text-left transition flex items-center justify-between group active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-100 block leading-tight">
                  AI Macro Coach
                </span>
                <span className="text-[10px] text-zinc-400">
                  Advice & swaps
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
          </button>
        </div>

        {/* 1. Daily Dashboard Ring & Macro Bars */}
        <DailyRing meals={dayMeals} targets={settings.targets} t={t} />

        {/* 2. AI Photo/Text Meal Logger */}
        <AiMealLogger
          selectedDate={selectedDate}
          onMealLogged={handleMealLogged}
          t={t}
        />

        {/* Quick Database Search Action Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200 transition shadow-xs active:scale-98"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Search Verified USDA Database</span>
          </button>
        </div>

        {/* 3. Daily Logged Meals List */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {t.allMeals} ({dayMeals.length})
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              {dayMeals.reduce((acc, m) => acc + m.calories, 0)} {t.kcal} logged
            </span>
          </div>
          <MealList
            meals={dayMeals}
            onDeleteMeal={handleDeleteMeal}
            onOpenSearch={() => setIsSearchOpen(true)}
            t={t}
          />
        </div>
      </main>

      {/* Bottom Floating Quick-Dock for One-Handed Mobile Reach */}
      <footer className="fixed bottom-0 inset-x-0 z-20 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800/80 py-2 px-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {/* Dashboard Tab */}
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center text-xs font-medium text-emerald-400 py-1 px-2.5 rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">{t.dashboard}</span>
          </button>

          {/* AI Coach Tab */}
          <button
            type="button"
            onClick={() => setIsCoachOpen(true)}
            className="flex flex-col items-center text-xs font-medium text-zinc-400 hover:text-amber-300 py-1 px-2.5 rounded-xl transition"
          >
            <Bot className="w-4 h-4 text-amber-400/90" />
            <span className="text-[9px] mt-0.5">Coach</span>
          </button>

          {/* Calorie Guide Tab */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex flex-col items-center text-xs font-medium text-zinc-400 hover:text-emerald-300 py-1 px-2.5 rounded-xl transition"
          >
            <Calculator className="w-4 h-4 text-emerald-400/90" />
            <span className="text-[9px] mt-0.5">Guide</span>
          </button>

          {/* Search Foods Tab */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center text-xs font-medium text-zinc-400 hover:text-zinc-200 py-1 px-2.5 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">{t.searchFoods}</span>
          </button>

          {/* Pricing Tab */}
          <button
            type="button"
            onClick={() => setIsPricingOpen(true)}
            className="flex flex-col items-center text-xs font-medium text-zinc-400 hover:text-emerald-300 py-1 px-2.5 rounded-xl transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">{t.honestPricing}</span>
          </button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <FoodSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        selectedDate={selectedDate}
        onFoodAdded={handleMealLogged}
        t={t}
      />

      <HonestPricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        t={t}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onExportJson={() => exportMealsAsJson(meals)}
        onExportCsv={() => exportMealsAsCsv(meals)}
        onResetMeals={handleResetMeals}
        onOpenGuide={() => setIsGuideOpen(true)}
        t={t}
      />

      {/* AI Calorie & Macro Calculator Onboarding / Guide */}
      <CalorieGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentTargets={settings.targets}
        onApplyTargets={handleApplyTargets}
        t={t}
      />

      {/* Built-in AI Macro Coach Chatbox */}
      <AiCoachChat
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        selectedDate={selectedDate}
        targets={settings.targets}
        meals={dayMeals}
        t={t}
      />
    </div>
  );
}
