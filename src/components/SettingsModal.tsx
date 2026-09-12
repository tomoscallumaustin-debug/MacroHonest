import React, { useState } from "react";
import {
  X,
  Sliders,
  Moon,
  Sun,
  Monitor,
  Globe,
  Download,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Calculator,
  Sparkles,
} from "lucide-react";
import { SupportedLanguage, UserSettings } from "../types";
import { TranslationStrings } from "../utils/translations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onResetMeals: () => void;
  onOpenGuide?: () => void;
  t: TranslationStrings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportJson,
  onExportCsv,
  onResetMeals,
  onOpenGuide,
  t,
}) => {
  const [calories, setCalories] = useState(settings.targets.calories);
  const [protein, setProtein] = useState(settings.targets.proteinGrams);
  const [carbs, setCarbs] = useState(settings.targets.carbsGrams);
  const [fat, setFat] = useState(settings.targets.fatGrams);
  const [savedNotice, setSavedNotice] = useState(false);

  // Keep in sync with settings prop if changed externally
  React.useEffect(() => {
    setCalories(settings.targets.calories);
    setProtein(settings.targets.proteinGrams);
    setCarbs(settings.targets.carbsGrams);
    setFat(settings.targets.fatGrams);
  }, [settings.targets]);

  if (!isOpen) return null;

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      targets: {
        calories: Number(calories) || 2000,
        proteinGrams: Number(protein) || 150,
        carbsGrams: Number(carbs) || 200,
        fatGrams: Number(fat) || 60,
      },
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleThemeSelect = (theme: "dark" | "light" | "system") => {
    onUpdateSettings({
      ...settings,
      theme,
    });
  };

  const handleLangSelect = (language: SupportedLanguage) => {
    onUpdateSettings({
      ...settings,
      language,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100">{t.settings}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Daily Nutrition Targets */}
          <form onSubmit={handleSaveTargets} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                {t.macroTargetsTitle}
              </span>
              {savedNotice && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Daily {t.calories} (kcal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-emerald-400 block mb-1">
                  {t.protein} Target (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-amber-400 block mb-1">
                  {t.carbs} Target (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-sky-400 block mb-1">
                  {t.fat} Target (g)
                </label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
              >
                Save Custom Targets
              </button>
              {onOpenGuide && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5"
                  title="Use AI Calorie & Macro Guide"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>AI Guide</span>
                </button>
              )}
            </div>
          </form>

          {/* Theme Selector */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide block">
              {t.appearance}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleThemeSelect("dark")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  settings.theme === "dark"
                    ? "bg-zinc-800 border-emerald-500 text-emerald-300"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeSelect("light")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  settings.theme === "light"
                    ? "bg-zinc-800 border-emerald-500 text-emerald-300"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{t.themeLight}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeSelect("system")}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  settings.theme === "system"
                    ? "bg-zinc-800 border-emerald-500 text-emerald-300"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{t.themeSystem}</span>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide block">
              {t.languageSelect}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: "en", name: "English" },
                { code: "es", name: "Español" },
                { code: "fr", name: "Français" },
                { code: "de", name: "Deutsch" },
                { code: "ja", name: "日本語" },
                { code: "pt", name: "Português" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangSelect(lang.code as SupportedLanguage)}
                  className={`p-2 rounded-xl border text-xs font-medium transition ${
                    settings.language === lang.code
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Data Export & Privacy */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide block">
              {t.dataManagement}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportJson}
                className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.exportDataJson}</span>
              </button>

              <button
                type="button"
                onClick={onExportCsv}
                className="p-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.exportDataCsv}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onResetMeals}
              className="w-full mt-1 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.resetData}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
