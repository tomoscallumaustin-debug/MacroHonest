import React from "react";
import { MacroTargets, LoggedMeal } from "../types";
import { TranslationStrings } from "../utils/translations";

interface DailyRingProps {
  meals: LoggedMeal[];
  targets: MacroTargets;
  t: TranslationStrings;
}

export const DailyRing: React.FC<DailyRingProps> = ({ meals, targets, t }) => {
  // Aggregate consumed macros for this date
  const consumed = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.proteinGrams;
      acc.carbs += m.carbsGrams;
      acc.fat += m.fatGrams;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const roundedCalories = Math.round(consumed.calories);
  const roundedProtein = Math.round(consumed.protein);
  const roundedCarbs = Math.round(consumed.carbs);
  const roundedFat = Math.round(consumed.fat);

  const calRemaining = targets.calories - roundedCalories;
  const isOver = calRemaining < 0;

  // Circular progress calculation
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(
    1,
    Math.max(0, targets.calories > 0 ? roundedCalories / targets.calories : 0)
  );
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Macros percentages
  const proteinPercent = Math.min(
    100,
    Math.round((roundedProtein / (targets.proteinGrams || 1)) * 100)
  );
  const carbsPercent = Math.min(
    100,
    Math.round((roundedCarbs / (targets.carbsGrams || 1)) * 100)
  );
  const fatPercent = Math.min(
    100,
    Math.round((roundedFat / (targets.fatGrams || 1)) * 100)
  );

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
      {/* Visual Ring Header */}
      <div className="flex flex-col items-center justify-center relative my-1">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-label="Calorie progress ring"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-800"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`transition-all duration-700 ease-out ${
              isOver ? "text-rose-500" : "text-emerald-500"
            }`}
          />
        </svg>

        {/* Center Text Stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight text-zinc-100 font-mono">
            {isOver ? `+${Math.abs(calRemaining)}` : Math.max(0, calRemaining)}
          </span>
          <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400 mt-0.5">
            {isOver ? t.overTarget : `${t.remaining} ${t.kcal}`}
          </span>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
            <span className="text-zinc-300 font-semibold">{roundedCalories}</span>
            <span>/</span>
            <span>{targets.calories} {t.kcal}</span>
          </div>
        </div>
      </div>

      {/* Macro Breakdown Bars */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/60">
        {/* Protein */}
        <div className="bg-zinc-950/40 rounded-xl p-2.5 border border-zinc-800/60 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-emerald-400">{t.protein}</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {proteinPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 font-mono text-xs text-zinc-200">
            <span className="font-bold text-sm text-zinc-100">{roundedProtein}</span>
            <span className="text-zinc-500 text-[10px]">/ {targets.proteinGrams}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, proteinPercent)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-zinc-950/40 rounded-xl p-2.5 border border-zinc-800/60 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-amber-400">{t.carbs}</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {carbsPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 font-mono text-xs text-zinc-200">
            <span className="font-bold text-sm text-zinc-100">{roundedCarbs}</span>
            <span className="text-zinc-500 text-[10px]">/ {targets.carbsGrams}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, carbsPercent)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-zinc-950/40 rounded-xl p-2.5 border border-zinc-800/60 flex flex-col">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-sky-400">{t.fat}</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {fatPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 font-mono text-xs text-zinc-200">
            <span className="font-bold text-sm text-zinc-100">{roundedFat}</span>
            <span className="text-zinc-500 text-[10px]">/ {targets.fatGrams}g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, fatPercent)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
