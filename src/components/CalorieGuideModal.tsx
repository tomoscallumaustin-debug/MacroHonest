import React, { useState } from "react";
import {
  Calculator,
  Sparkles,
  X,
  Scale,
  Activity,
  Target,
  Flame,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Dumbbell,
  Leaf,
  Apple,
} from "lucide-react";
import { CalculatedTargetsResult, MacroTargets, UserProfileInputs } from "../types";
import { TranslationStrings } from "../utils/translations";

interface CalorieGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargets: MacroTargets;
  onApplyTargets: (newTargets: MacroTargets) => void;
  t: TranslationStrings;
}

export const CalorieGuideModal: React.FC<CalorieGuideModalProps> = ({
  isOpen,
  onClose,
  currentTargets,
  onApplyTargets,
  t,
}) => {
  // Unit mode
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Inputs
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [weightKg, setWeightKg] = useState<number>(75);
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);

  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "very_active" | "athlete"
  >("moderate");

  const [goal, setGoal] = useState<
    "fat_loss" | "slow_cut" | "maintenance" | "lean_bulk" | "muscle_gain"
  >("fat_loss");

  const [dietaryPreference, setDietaryPreference] = useState<
    "balanced" | "high_protein" | "keto" | "vegan" | "vegetarian" | "low_carb"
  >("balanced");

  const [notes, setNotes] = useState<string>("");

  // Loading & Result states
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatedTargetsResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  // Sync weights when unit changes
  const handleWeightChange = (val: number, system: "metric" | "imperial") => {
    if (system === "metric") {
      setWeightKg(val);
      setWeightLbs(Math.round(val * 2.20462));
    } else {
      setWeightLbs(val);
      setWeightKg(Math.round(val / 2.20462));
    }
  };

  // Sync heights
  const handleHeightMetricChange = (val: number) => {
    setHeightCm(val);
    const totalInches = val / 2.54;
    setHeightFt(Math.floor(totalInches / 12));
    setHeightIn(Math.round(totalInches % 12));
  };

  const handleHeightImperialChange = (ft: number, inches: number) => {
    setHeightFt(ft);
    setHeightIn(inches);
    const totalInches = ft * 12 + inches;
    setHeightCm(Math.round(totalInches * 2.54));
  };

  // Presets for quick-testing
  const applyPreset = (preset: "fat_loss" | "muscle_gain" | "vegan") => {
    if (preset === "fat_loss") {
      setAge(30);
      setGender("female");
      setWeightKg(68);
      setWeightLbs(150);
      setHeightCm(165);
      setActivityLevel("moderate");
      setGoal("fat_loss");
      setDietaryPreference("high_protein");
      setNotes("Desk job, workout 3x a week");
    } else if (preset === "muscle_gain") {
      setAge(25);
      setGender("male");
      setWeightKg(78);
      setWeightLbs(172);
      setHeightCm(180);
      setActivityLevel("very_active");
      setGoal("muscle_gain");
      setDietaryPreference("balanced");
      setNotes("Weightlifting 5x a week, wanting lean mass");
    } else {
      setAge(32);
      setGender("male");
      setWeightKg(72);
      setWeightLbs(158);
      setHeightCm(175);
      setActivityLevel("moderate");
      setGoal("maintenance");
      setDietaryPreference("vegan");
      setNotes("Plant-based runner");
    }
    setResult(null);
  };

  // Trigger calculation
  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    setErrorMsg(null);
    setAppliedSuccess(false);

    try {
      const payload: UserProfileInputs = {
        age: Number(age),
        gender,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        activityLevel,
        goal,
        dietaryPreference,
        notes: notes.trim() || undefined,
      };

      const response = await fetch("/api/calculate-targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate targets.");
      }

      const data: CalculatedTargetsResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to calculate targets. Please retry.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApplyToDashboard = () => {
    if (!result) return;
    onApplyTargets({
      calories: result.calories,
      proteinGrams: result.proteinGrams,
      carbsGrams: result.carbsGrams,
      fatGrams: result.fatGrams,
    });
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>AI Calorie & Macro Guide</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Grounded
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400">
                Personalized targets grounded in nutritional science
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-zinc-400">
                Quick Sample Profiles:
              </span>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUnitSystem("metric")}
                  className={`px-2 py-0.5 rounded transition ${
                    unitSystem === "metric"
                      ? "bg-zinc-800 text-emerald-300 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem("imperial")}
                  className={`px-2 py-0.5 rounded transition ${
                    unitSystem === "imperial"
                      ? "bg-zinc-800 text-emerald-300 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => applyPreset("fat_loss")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-[11px] text-zinc-300 shrink-0 transition flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Desk Worker Cut</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("muscle_gain")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-[11px] text-zinc-300 shrink-0 transition flex items-center gap-1"
              >
                <Dumbbell className="w-3 h-3 text-sky-400" />
                <span>Lifter Bulk</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("vegan")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-[11px] text-zinc-300 shrink-0 transition flex items-center gap-1"
              >
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span>Plant-Based Runner</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCalculate} className="space-y-3">
            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Biological Sex
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Neutral</option>
                </select>
              </div>
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Weight {unitSystem === "metric" ? "(kg)" : "(lbs)"}
                </label>
                {unitSystem === "metric" ? (
                  <input
                    type="number"
                    step="0.5"
                    min={35}
                    max={250}
                    value={weightKg}
                    onChange={(e) =>
                      handleWeightChange(Number(e.target.value), "metric")
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    required
                  />
                ) : (
                  <input
                    type="number"
                    step="1"
                    min={70}
                    max={550}
                    value={weightLbs}
                    onChange={(e) =>
                      handleWeightChange(Number(e.target.value), "imperial")
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    required
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Height {unitSystem === "metric" ? "(cm)" : "(ft / in)"}
                </label>
                {unitSystem === "metric" ? (
                  <input
                    type="number"
                    min={120}
                    max={230}
                    value={heightCm}
                    onChange={(e) =>
                      handleHeightMetricChange(Number(e.target.value))
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    required
                  />
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={heightFt}
                      onChange={(e) =>
                        handleHeightImperialChange(
                          Number(e.target.value),
                          heightIn
                        )
                      }
                      className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-100 font-mono text-center"
                      placeholder="ft"
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={heightIn}
                      onChange={(e) =>
                        handleHeightImperialChange(
                          heightFt,
                          Number(e.target.value)
                        )
                      }
                      className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-zinc-100 font-mono text-center"
                      placeholder="in"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1 flex items-center justify-between">
                <span>Daily Activity & Energy Output</span>
                <span className="text-[10px] text-emerald-400">TDEE Factor</span>
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              >
                <option value="sedentary">
                  Sedentary (desk job, little or no exercise)
                </option>
                <option value="light">
                  Lightly Active (light exercise 1–3 days/week)
                </option>
                <option value="moderate">
                  Moderately Active (workout 3–5 days/week)
                </option>
                <option value="very_active">
                  Very Active (hard training 6–7 days/week)
                </option>
                <option value="athlete">
                  Extremely Active / Athlete (2x training/day or physical job)
                </option>
              </select>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-medium"
              >
                <option value="fat_loss">
                  Sustainable Fat Loss (~400 kcal deficit)
                </option>
                <option value="slow_cut">
                  Gentle Cut / Recomp (~250 kcal deficit)
                </option>
                <option value="maintenance">
                  Maintenance (preserve weight & energy)
                </option>
                <option value="lean_bulk">
                  Lean Muscle Growth (~250 kcal surplus)
                </option>
                <option value="muscle_gain">
                  Active Muscle Gain (~400 kcal surplus)
                </option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Dietary Preference / Style
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
              >
                <option value="balanced">Balanced Macro Distribution</option>
                <option value="high_protein">
                  High Protein (Lifters & Muscle Retention)
                </option>
                <option value="low_carb">Lower Carbohydrate</option>
                <option value="keto">Ketogenic (High Healthy Fats)</option>
                <option value="vegan">Vegan / 100% Plant-Based</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Optional Notes (Lifestyle or Training Routine)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Training for a 10k, or preparing for summer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-98"
            >
              {isCalculating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Science-Backed Targets...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculate My Ideal Targets</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="pt-3 border-t border-zinc-800 space-y-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Recommended Daily Targets
                </span>
                <span className="text-[10px] text-zinc-400">
                  {result.source === "gemini_ai" ? "Gemini AI" : "Scientific Formula"}
                </span>
              </div>

              {/* Energy Summary Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">BMR</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">
                    {result.bmr} kcal
                  </span>
                </div>
                <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">TDEE</span>
                  <span className="text-xs font-bold text-zinc-200 font-mono">
                    {result.tdee} kcal
                  </span>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    Target
                  </span>
                  <span className="text-sm font-black text-emerald-300 font-mono">
                    {result.calories} kcal
                  </span>
                </div>
              </div>

              {/* Macro breakdown cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-emerald-400 block">
                    Protein
                  </span>
                  <span className="text-xs font-bold text-zinc-100 font-mono">
                    {result.proteinGrams}g
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    {result.proteinGrams * 4} kcal
                  </span>
                </div>
                <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-amber-400 block">
                    Carbs
                  </span>
                  <span className="text-xs font-bold text-zinc-100 font-mono">
                    {result.carbsGrams}g
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    {result.carbsGrams * 4} kcal
                  </span>
                </div>
                <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-sky-400 block">
                    Fats
                  </span>
                  <span className="text-xs font-bold text-zinc-100 font-mono">
                    {result.fatGrams}g
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    {result.fatGrams * 9} kcal
                  </span>
                </div>
              </div>

              {/* Explanation & Honest Advice */}
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <span className="font-semibold text-zinc-300 block mb-0.5">
                    Scientific Breakdown:
                  </span>
                  <p className="text-zinc-400">{result.explanation}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300/90">
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    Honest Nutrition Truth:
                  </span>
                  <p className="text-zinc-400">{result.honestAdvice}</p>
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyToDashboard}
                disabled={appliedSuccess}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
              >
                {appliedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-zinc-950" />
                    <span>Applied to Dashboard!</span>
                  </>
                ) : (
                  <>
                    <span>Apply These Targets to My Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Current target: {currentTargets.calories} kcal
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
