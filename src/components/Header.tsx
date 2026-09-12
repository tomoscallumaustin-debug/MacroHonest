import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  ShieldCheck,
  Globe,
  Calculator,
  Bot,
} from "lucide-react";
import { SupportedLanguage, UserSettings } from "../types";
import { TRANSLATIONS } from "../utils/translations";
import { formatDateRelative, getTodayDateString, offsetDate } from "../utils/storage";

interface HeaderProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  settings: UserSettings;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onOpenGuide: () => void;
  onOpenCoach: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  settings,
  onOpenSettings,
  onOpenPricing,
  onOpenGuide,
  onOpenCoach,
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  const todayStr = getTodayDateString();
  const dateLabel = formatDateRelative(selectedDate, todayStr);

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand & Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-tight shadow-sm">
            <span className="text-base">M</span>
            <span className="text-[10px] text-emerald-300 -ml-0.5">H</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-100 text-sm tracking-tight">
                MacroHonest
              </span>
              {settings.isSupporter ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Honest
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Fair
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Zero bloat • Local first
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Calorie Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-1.5 text-zinc-400 hover:text-emerald-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition text-xs flex items-center gap-1"
            title="AI Calorie & Macro Guide"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] font-medium">Guide</span>
          </button>

          {/* AI Coach Button */}
          <button
            type="button"
            onClick={onOpenCoach}
            className="p-1.5 text-zinc-400 hover:text-emerald-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition text-xs flex items-center gap-1"
            title="AI Macro Coach"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px] font-medium">Coach</span>
          </button>

          {/* Language Switcher */}
          <div className="relative group">
            <button
              type="button"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition text-xs flex items-center gap-1"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px] font-mono">
                {settings.language}
              </span>
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-xl z-50 min-w-[120px]">
              {(["en", "es", "fr", "de", "ja", "pt"] as SupportedLanguage[]).map(
                (lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onLanguageChange(lang)}
                    className={`px-2 py-1.5 rounded-lg text-left text-xs font-medium transition flex items-center justify-between ${
                      settings.language === lang
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span>
                      {lang === "en" && "English"}
                      {lang === "es" && "Español"}
                      {lang === "fr" && "Français"}
                      {lang === "de" && "Deutsch"}
                      {lang === "ja" && "日本語"}
                      {lang === "pt" && "Português"}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">
                      {lang}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Pricing Button */}
          <button
            type="button"
            onClick={onOpenPricing}
            className="p-1.5 text-zinc-400 hover:text-emerald-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
            title="Honest Paywall & Manifesto"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
            title={t.settings}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>


      {/* Date Navigation Bar */}
      <div className="max-w-md mx-auto mt-2 pt-2 border-t border-zinc-800/40 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onDateChange(offsetDate(selectedDate, -1))}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">
            {dateLabel}
          </span>
          {selectedDate !== todayStr && (
            <button
              type="button"
              onClick={() => onDateChange(todayStr)}
              className="text-[10px] text-emerald-400 hover:underline font-medium px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20"
            >
              {t.today}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDateChange(offsetDate(selectedDate, 1))}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
