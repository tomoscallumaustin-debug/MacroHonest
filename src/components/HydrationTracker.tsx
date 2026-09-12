import React, { useState, useEffect } from "react";
import {
  Droplets,
  Droplet,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Settings2,
  Waves,
  X,
  Check,
} from "lucide-react";
import { TranslationStrings } from "../utils/translations";
import {
  loadDailyWater,
  saveDailyWater,
  DEFAULT_WATER_GOAL_ML,
} from "../utils/storage";

interface HydrationTrackerProps {
  selectedDate: string;
  t: TranslationStrings;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  selectedDate,
  t,
}) => {
  const [waterData, setWaterData] = useState(() => loadDailyWater(selectedDate));
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(waterData.goalMl.toString());
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMl, setCustomMl] = useState("330");
  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null);

  // Sync state when selectedDate changes
  useEffect(() => {
    const loaded = loadDailyWater(selectedDate);
    setWaterData(loaded);
    setTempGoal(loaded.goalMl.toString());
  }, [selectedDate]);

  const updateWater = (newAmount: number, newGoal = waterData.goalMl) => {
    const clampedAmount = Math.max(0, Math.round(newAmount));
    const clampedGoal = Math.max(500, Math.round(newGoal));
    setWaterData({ amountMl: clampedAmount, goalMl: clampedGoal });
    saveDailyWater(selectedDate, clampedAmount, clampedGoal);
  };

  const handleAddWater = (deltaMl: number) => {
    const next = waterData.amountMl + deltaMl;
    updateWater(next);
    if (deltaMl > 0) {
      setRecentlyAdded(deltaMl);
      setTimeout(() => setRecentlyAdded(null), 1500);
    }
  };

  const handleResetWater = () => {
    if (window.confirm("Reset water log for this day to 0 ml?")) {
      updateWater(0);
    }
  };

  const handleSaveGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = Number(tempGoal);
    if (parsed && parsed >= 500 && parsed <= 10000) {
      updateWater(waterData.amountMl, parsed);
      setIsEditingGoal(false);
    }
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(customMl);
    if (parsed && parsed > 0) {
      handleAddWater(parsed);
      setShowCustomModal(false);
      setCustomMl("330");
    }
  };

  const percentage = Math.min(
    200,
    Math.round((waterData.amountMl / (waterData.goalMl || DEFAULT_WATER_GOAL_ML)) * 100)
  );

  const isGoalReached = waterData.amountMl >= waterData.goalMl && waterData.goalMl > 0;
  const remainingMl = Math.max(0, waterData.goalMl - waterData.amountMl);

  // Convert ml to fluid ounces (1 ml ≈ 0.033814 fl oz)
  const toOz = (ml: number) => (ml * 0.033814).toFixed(1);

  // Cup indicator math (each cup = 250ml)
  const cupIncrement = 250;
  const totalCups = Math.min(12, Math.max(6, Math.round(waterData.goalMl / cupIncrement)));
  const filledCups = Math.floor(waterData.amountMl / cupIncrement);

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      {/* Background ambient water glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Daily Hydration
              </h3>
              {isGoalReached && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  Goal Met
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400">
              Target:{" "}
              {unit === "ml"
                ? `${waterData.goalMl} ml`
                : `${toOz(waterData.goalMl)} fl oz`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setUnit((prev) => (prev === "ml" ? "oz" : "ml"))}
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            title="Toggle measurement unit"
          >
            {unit.toUpperCase()}
          </button>

          {/* Edit Goal Button */}
          <button
            type="button"
            onClick={() => setIsEditingGoal(!isEditingGoal)}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-cyan-300 transition"
            title="Adjust daily water goal"
            aria-label="Adjust daily water goal"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Goal Editor */}
      {isEditingGoal && (
        <form
          onSubmit={handleSaveGoal}
          className="mb-3 p-2.5 rounded-xl bg-zinc-950/80 border border-cyan-500/30 space-y-2 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold text-cyan-400">Daily Water Goal</span>
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="50"
              min="500"
              max="8000"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-100 font-mono focus:outline-hidden focus:border-cyan-400"
              placeholder="e.g. 2500"
            />
            <span className="text-xs text-zinc-400 font-mono">ml</span>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition"
            >
              Save
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
            <span className="text-zinc-500 shrink-0">Presets:</span>
            {[2000, 2500, 3000, 3500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTempGoal(preset.toString());
                  updateWater(waterData.amountMl, preset);
                  setIsEditingGoal(false);
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
              >
                {preset} ml
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Main Hydration Progress Display */}
      <div className="space-y-2 mb-3">
        {/* Numbers & Percentage */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-extrabold text-cyan-400 tracking-tight">
              {unit === "ml"
                ? `${waterData.amountMl.toLocaleString()}`
                : `${toOz(waterData.amountMl)}`}
            </span>
            <span className="text-xs text-zinc-400">
              /{" "}
              {unit === "ml"
                ? `${waterData.goalMl.toLocaleString()} ml`
                : `${toOz(waterData.goalMl)} oz`}
            </span>
          </div>

          <div className="text-right">
            <span
              className={`text-sm font-bold font-mono ${
                isGoalReached ? "text-cyan-300" : "text-zinc-300"
              }`}
            >
              {percentage}%
            </span>
            <span className="block text-[10px] text-zinc-500">
              {isGoalReached
                ? "Target achieved!"
                : `${
                    unit === "ml"
                      ? `${remainingMl.toLocaleString()} ml left`
                      : `${toOz(remainingMl)} oz left`
                  }`}
            </span>
          </div>
        </div>

        {/* Visual Fluid Progress Bar */}
        <div className="h-3 w-full bg-zinc-950 rounded-full border border-zinc-800/80 overflow-hidden relative p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out bg-linear-to-r ${
              isGoalReached
                ? "from-cyan-400 via-sky-300 to-emerald-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "from-sky-600 via-cyan-500 to-sky-400"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        {/* Visual Cups Milestones Row */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 no-scrollbar">
            {Array.from({ length: totalCups }).map((_, idx) => {
              const isFilled = idx < filledCups;
              const isCurrent = idx === filledCups && waterData.amountMl % cupIncrement > 0;
              const cupMl = (idx + 1) * cupIncrement;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    // Tap cup to toggle level to that cup
                    if (isFilled && idx === filledCups - 1) {
                      // Undo last cup
                      updateWater((idx) * cupIncrement);
                    } else {
                      // Fill up to this cup
                      updateWater(cupMl);
                    }
                  }}
                  className={`group flex-1 flex flex-col items-center justify-center p-1 rounded-lg border transition duration-150 ${
                    isFilled
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25"
                      : isCurrent
                      ? "bg-sky-950/40 border-sky-400/50 text-sky-300"
                      : "bg-zinc-950/40 border-zinc-800/80 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                  }`}
                  title={`${cupMl} ml (${idx + 1} glass)`}
                >
                  <Droplet
                    className={`w-3.5 h-3.5 transition group-hover:scale-110 ${
                      isFilled ? "fill-cyan-400 text-cyan-400" : ""
                    }`}
                  />
                  <span className="text-[8px] font-mono mt-0.5 opacity-80">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1-Tap Quick Action Log Buttons */}
      <div className="pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-zinc-400">
            Tap to quick log:
          </span>
          {recentlyAdded && (
            <span className="text-[11px] font-mono font-semibold text-cyan-400 animate-fade-in">
              +{recentlyAdded} ml logged!
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {/* Glass: +250ml */}
          <button
            type="button"
            onClick={() => handleAddWater(250)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800/90 hover:border-cyan-500/40 text-zinc-200 transition active:scale-95 group"
          >
            <div className="flex items-center gap-0.5 text-cyan-400 font-bold text-xs">
              <Plus className="w-3 h-3 group-hover:scale-125 transition" />
              <span>250</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-0.5">Glass</span>
          </button>

          {/* Bottle: +500ml */}
          <button
            type="button"
            onClick={() => handleAddWater(500)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800/90 hover:border-cyan-500/40 text-zinc-200 transition active:scale-95 group"
          >
            <div className="flex items-center gap-0.5 text-cyan-400 font-bold text-xs">
              <Plus className="w-3 h-3 group-hover:scale-125 transition" />
              <span>500</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-0.5">Bottle</span>
          </button>

          {/* Shaker / Flask: +750ml */}
          <button
            type="button"
            onClick={() => handleAddWater(750)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800/90 hover:border-cyan-500/40 text-zinc-200 transition active:scale-95 group"
          >
            <div className="flex items-center gap-0.5 text-cyan-400 font-bold text-xs">
              <Plus className="w-3 h-3 group-hover:scale-125 transition" />
              <span>750</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-0.5">Shaker</span>
          </button>

          {/* Sip / Quick: +100ml */}
          <button
            type="button"
            onClick={() => handleAddWater(100)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-zinc-950/90 hover:bg-zinc-800 border border-zinc-800/90 hover:border-cyan-500/40 text-zinc-200 transition active:scale-95 group"
          >
            <div className="flex items-center gap-0.5 text-cyan-400 font-bold text-xs">
              <Plus className="w-3 h-3 group-hover:scale-125 transition" />
              <span>100</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-0.5">Sip</span>
          </button>
        </div>

        {/* Bottom Utility Controls: Undo, Custom Amount, Reset */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800/50 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={waterData.amountMl === 0}
              onClick={() => handleAddWater(-250)}
              className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 disabled:opacity-30 flex items-center gap-1 transition"
              title="Undo 250ml"
            >
              <Minus className="w-3 h-3" />
              <span>250 ml</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 hover:text-cyan-300 transition"
            >
              Custom...
            </button>
          </div>

          {waterData.amountMl > 0 && (
            <button
              type="button"
              onClick={handleResetWater}
              className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition"
              title="Reset today's water"
              aria-label="Reset today's water"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-zinc-100">
                  Log Custom Water
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomAdd} className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Amount in Milliliters (ml)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="3000"
                    step="10"
                    autoFocus
                    value={customMl}
                    onChange={(e) => setCustomMl(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-hidden focus:border-cyan-400"
                    placeholder="330"
                  />
                  <span className="text-xs text-zinc-400 font-mono">ml</span>
                </div>
              </div>

              {/* Quick beverage chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                {[
                  { label: "Can (330ml)", val: 330 },
                  { label: "Mug (350ml)", val: 350 },
                  { label: "Large Cup (400ml)", val: 400 },
                  { label: "Litre (1000ml)", val: 1000 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCustomMl(item.val.toString())}
                    className="px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition"
                >
                  Add Water
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
