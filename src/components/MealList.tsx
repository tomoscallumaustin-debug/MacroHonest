import React, { useState } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
  Database,
  CheckCircle2,
  Plus,
  Coffee,
  Sun,
  Moon,
  Apple,
} from "lucide-react";
import { ConfidenceScore, LoggedMeal, MealType } from "../types";
import { TranslationStrings } from "../utils/translations";

interface MealListProps {
  meals: LoggedMeal[];
  onDeleteMeal: (id: string) => void;
  onOpenSearch: () => void;
  t: TranslationStrings;
}

export const MealList: React.FC<MealListProps> = ({
  meals,
  onDeleteMeal,
  onOpenSearch,
  t,
}) => {
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedMealId(expandedMealId === id ? null : id);
  };

  const mealTypeConfig: Record<
    MealType,
    { label: string; icon: React.ReactNode }
  > = {
    breakfast: {
      label: t.breakfast,
      icon: <Coffee className="w-3.5 h-3.5 text-amber-400" />,
    },
    lunch: {
      label: t.lunch,
      icon: <Sun className="w-3.5 h-3.5 text-yellow-400" />,
    },
    dinner: {
      label: t.dinner,
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
    },
    snack: {
      label: t.snack,
      icon: <Apple className="w-3.5 h-3.5 text-emerald-400" />,
    },
  };

  const getConfidenceBadge = (conf?: ConfidenceScore) => {
    if (!conf) return null;
    const colors =
      conf === "High"
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : conf === "Medium"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors}`}
      >
        {conf}
      </span>
    );
  };

  const types: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="space-y-3">
      {types.map((type) => {
        const typeMeals = meals.filter((m) => m.mealType === type);
        const typeCalories = typeMeals.reduce((sum, m) => sum + m.calories, 0);

        return (
          <div
            key={type}
            className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3.5"
          >
            {/* Meal Category Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {mealTypeConfig[type].icon}
                <span className="text-xs font-semibold text-zinc-100">
                  {mealTypeConfig[type].label}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  • {typeCalories} kcal
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenSearch}
                className="text-xs text-zinc-400 hover:text-emerald-300 flex items-center gap-1 transition"
                title="Search Food Database"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">Add</span>
              </button>
            </div>

            {/* Meals in this category */}
            {typeMeals.length === 0 ? (
              <p className="text-[11px] text-zinc-400 py-1.5 px-2 bg-zinc-950/30 rounded-xl border border-dashed border-zinc-800/60 text-center">
                No items logged yet
              </p>
            ) : (
              <div className="space-y-2">
                {typeMeals.map((meal) => {
                  const isExpanded = expandedMealId === meal.id;
                  const hasDetails =
                    (meal.items && meal.items.length > 0) ||
                    meal.confidenceReason ||
                    meal.honestTip ||
                    meal.photoUrl;

                  return (
                    <div
                      key={meal.id}
                      className="bg-zinc-950/60 border border-zinc-800/70 rounded-xl p-3 text-xs transition hover:border-zinc-700/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Meal Main Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-zinc-100 text-xs">
                              {meal.name}
                            </span>
                            {getConfidenceBadge(meal.confidenceScore)}
                            {meal.photoUrl && (
                              <span
                                className="text-zinc-400"
                                title="Contains food photo"
                              >
                                <Camera className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Macro breakdown */}
                          <div className="flex items-center gap-2.5 font-mono text-[11px] text-zinc-400">
                            <span className="font-bold text-zinc-200">
                              {meal.calories} kcal
                            </span>
                            <span className="text-emerald-400">
                              P: {meal.proteinGrams}g
                            </span>
                            <span className="text-amber-400">
                              C: {meal.carbsGrams}g
                            </span>
                            <span className="text-sky-400">
                              F: {meal.fatGrams}g
                            </span>
                            <span className="text-zinc-400 text-[10px]">
                              {meal.time}
                            </span>
                          </div>
                        </div>

                        {/* Expand & Delete actions */}
                        <div className="flex items-center gap-1">
                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(meal.id)}
                              className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition"
                              aria-label={isExpanded ? "Collapse" : "Expand details"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteMeal(meal.id)}
                            className="p-1 text-zinc-400 hover:text-rose-400 rounded transition"
                            title="Delete meal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable transparent breakdown */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 space-y-2 text-[11px] animate-in fade-in duration-200">
                          {/* Photo preview if present */}
                          {meal.photoUrl && (
                            <div className="rounded-lg overflow-hidden border border-zinc-800 max-h-36 max-w-44">
                              <img
                                src={meal.photoUrl}
                                alt="Logged meal"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}

                          {/* Confidence Reason */}
                          {meal.confidenceReason && (
                            <div className="text-zinc-300 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                              <span className="font-semibold text-zinc-200">
                                {t.confidenceReason}:{" "}
                              </span>
                              <span className="text-zinc-400">
                                {meal.confidenceReason}
                              </span>
                            </div>
                          )}

                          {/* Honest Tip */}
                          {meal.honestTip && (
                            <div className="text-amber-300/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                              <span className="font-semibold text-amber-300">
                                {t.honestNote}:{" "}
                              </span>
                              <span className="text-zinc-400">
                                {meal.honestTip}
                              </span>
                            </div>
                          )}

                          {/* Itemized ingredients */}
                          {meal.items && meal.items.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-semibold text-zinc-400">
                                Sub-items
                              </span>
                              {meal.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-zinc-400 px-1 py-0.5"
                                >
                                  <span>
                                    {item.name} ({item.portion})
                                  </span>
                                  <span className="font-mono text-zinc-300">
                                    {item.calories} kcal
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
