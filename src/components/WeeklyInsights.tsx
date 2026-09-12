import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Flame,
  Dumbbell,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import { LoggedMeal, MacroTargets } from "../types";
import { TranslationStrings } from "../utils/translations";

interface WeeklyInsightsProps {
  meals: LoggedMeal[];
  targets: MacroTargets;
  selectedDate: string;
  onDateSelect?: (date: string) => void;
  t: TranslationStrings;
}

type TabMode = "calories" | "macros" | "patterns";

interface DayData {
  dateStr: string;
  dayLabel: string;
  fullDateLabel: string;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  status: "perfect" | "under" | "over" | "empty";
}

export function WeeklyInsights({
  meals,
  targets,
  selectedDate,
  onDateSelect,
  t,
}: WeeklyInsightsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabMode>("calories");

  // Compute 7 days leading up to selectedDate
  const { weekData, stats, patterns } = useMemo(() => {
    const days: DayData[] = [];
    const [year, month, day] = selectedDate.split("-").map(Number);
    const refDate = new Date(year, month - 1, day);
    const todayStr = new Date().toISOString().split("T")[0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });
      const fullDateLabel = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        weekday: "short",
      });

      const dayMeals = meals.filter((m) => m.date === dateStr);
      const calories = dayMeals.reduce((acc, m) => acc + m.calories, 0);
      const protein = Math.round(dayMeals.reduce((acc, m) => acc + m.proteinGrams, 0));
      const carbs = Math.round(dayMeals.reduce((acc, m) => acc + m.carbsGrams, 0));
      const fat = Math.round(dayMeals.reduce((acc, m) => acc + m.fatGrams, 0));

      let status: DayData["status"] = "empty";
      if (dayMeals.length > 0) {
        const diff = calories - targets.calories;
        if (Math.abs(diff) <= targets.calories * 0.1) {
          status = "perfect";
        } else if (diff < 0) {
          status = "under";
        } else {
          status = "over";
        }
      }

      days.push({
        dateStr,
        dayLabel,
        fullDateLabel,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        isWeekend,
        calories,
        protein,
        carbs,
        fat,
        mealCount: dayMeals.length,
        calorieTarget: targets.calories,
        proteinTarget: targets.proteinGrams,
        carbsTarget: targets.carbsGrams,
        fatTarget: targets.fatGrams,
        status,
      });
    }

    // Weekly statistics
    const loggedDays = days.filter((d) => d.mealCount > 0);
    const loggedCount = loggedDays.length;

    const totalCalories = days.reduce((sum, d) => sum + d.calories, 0);
    const totalProtein = days.reduce((sum, d) => sum + d.protein, 0);
    const totalCarbs = days.reduce((sum, d) => sum + d.carbs, 0);
    const totalFat = days.reduce((sum, d) => sum + d.fat, 0);

    const avgCalories = loggedCount > 0 ? Math.round(totalCalories / loggedCount) : 0;
    const avgProtein = loggedCount > 0 ? Math.round(totalProtein / loggedCount) : 0;
    const avgCarbs = loggedCount > 0 ? Math.round(totalCarbs / loggedCount) : 0;
    const avgFat = loggedCount > 0 ? Math.round(totalFat / loggedCount) : 0;

    // Macro percentage ratio
    const totalMacroEnergy = avgProtein * 4 + avgCarbs * 4 + avgFat * 9;
    const proteinPct = totalMacroEnergy > 0 ? Math.round(((avgProtein * 4) / totalMacroEnergy) * 100) : 0;
    const carbsPct = totalMacroEnergy > 0 ? Math.round(((avgCarbs * 4) / totalMacroEnergy) * 100) : 0;
    const fatPct = totalMacroEnergy > 0 ? Math.round(((avgFat * 9) / totalMacroEnergy) * 100) : 0;

    // Adherence count (within ±10% target)
    const targetMetDays = loggedDays.filter((d) => Math.abs(d.calories - targets.calories) <= targets.calories * 0.1).length;

    // Protein target hit count (>= 90% target)
    const proteinMetDays = loggedDays.filter((d) => d.protein >= targets.proteinGrams * 0.9).length;

    // Weekend vs Weekday analysis
    const weekendDays = loggedDays.filter((d) => d.isWeekend);
    const weekdayDays = loggedDays.filter((d) => !d.isWeekend);
    const weekendAvg = weekendDays.length > 0 ? Math.round(weekendDays.reduce((s, d) => s + d.calories, 0) / weekendDays.length) : 0;
    const weekdayAvg = weekdayDays.length > 0 ? Math.round(weekdayDays.reduce((s, d) => s + d.calories, 0) / weekdayDays.length) : 0;
    const weekendDiff = weekendAvg && weekdayAvg ? weekendAvg - weekdayAvg : 0;

    // Generated pattern insights
    const patternInsights: { title: string; desc: string; iconType: "success" | "warning" | "info" }[] = [];

    if (loggedCount === 0) {
      patternInsights.push({
        title: "Start Logging Your Days",
        desc: "As you log meals throughout the week, your 7-day caloric balance and macro consistency will visualize right here.",
        iconType: "info",
      });
    } else {
      // 1. Protein consistency
      if (proteinMetDays >= 5) {
        patternInsights.push({
          title: "Exceptional Protein Discipline",
          desc: `You achieved ≥ 90% of your protein goal on ${proteinMetDays} of ${loggedCount} logged days (${avgProtein}g/day average). Excellent for muscle retention and satiety!`,
          iconType: "success",
        });
      } else if (avgProtein < targets.proteinGrams * 0.8) {
        patternInsights.push({
          title: "Protein Opportunity",
          desc: `Daily protein averaged ${avgProtein}g vs your ${targets.proteinGrams}g target. Prioritizing protein at breakfast or snacks will help close this gap.`,
          iconType: "warning",
        });
      } else {
        patternInsights.push({
          title: "Protein Intake Baseline",
          desc: `Averaged ${avgProtein}g protein/day (${proteinMetDays}/${loggedCount} target hits). Aim for consistency across every meal.`,
          iconType: "info",
        });
      }

      // 2. Calorie stability & adherence
      if (targetMetDays >= 4) {
        patternInsights.push({
          title: "Consistent Caloric Adherence",
          desc: `You stayed within ±10% of your ${targets.calories} kcal target on ${targetMetDays} days this week. High consistency drives steady results!`,
          iconType: "success",
        });
      } else if (avgCalories > targets.calories * 1.15) {
        const overage = avgCalories - targets.calories;
        patternInsights.push({
          title: "Slight Calorie Surplus",
          desc: `Intake averaged +${overage} kcal/day above target (${avgCalories} kcal). Check hidden cooking oils or evening snacks.`,
          iconType: "warning",
        });
      } else if (avgCalories < targets.calories * 0.85) {
        const deficit = targets.calories - avgCalories;
        patternInsights.push({
          title: "Aggressive Deficit",
          desc: `Intake averaged -${deficit} kcal/day below target (${avgCalories} kcal). Ensure you are fueling properly to preserve energy and metabolic rate.`,
          iconType: "warning",
        });
      }

      // 3. Weekend vs Weekday trend
      if (weekendDays.length > 0 && weekdayDays.length > 0 && Math.abs(weekendDiff) > 200) {
        if (weekendDiff > 0) {
          patternInsights.push({
            title: "Weekend Elevation Pattern",
            desc: `Weekend calories averaged +${weekendDiff} kcal higher than weekdays (${weekendAvg} vs ${weekdayAvg} kcal). Factoring in weekend flexibility helps keep overall progress steady.`,
            iconType: "info",
          });
        } else {
          patternInsights.push({
            title: "Weekday vs Weekend Trend",
            desc: `Weekdays averaged +${Math.abs(weekendDiff)} kcal higher than weekends (${weekdayAvg} vs ${weekendAvg} kcal).`,
            iconType: "info",
          });
        }
      }

      // 4. Macro distribution split
      patternInsights.push({
        title: "7-Day Macro Energy Split",
        desc: `Average energy distribution: ${proteinPct}% Protein • ${carbsPct}% Carbohydrates • ${fatPct}% Fats.`,
        iconType: "info",
      });
    }

    return {
      weekData: days,
      stats: {
        loggedCount,
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        proteinPct,
        carbsPct,
        fatPct,
        targetMetDays,
        proteinMetDays,
      },
      patterns: patternInsights,
    };
  }, [meals, targets, selectedDate]);

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
      {/* Header & Collapse Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Weekly Insights</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Last 7 Days
              </span>
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          aria-label={isOpen ? "Collapse weekly insights" : "Expand weekly insights"}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-1">
          {/* Top Quick Summary Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70">
              <span className="text-[10px] text-zinc-400 font-medium block">Daily Avg</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-zinc-100">
                  {stats.avgCalories > 0 ? stats.avgCalories : "—"}
                </span>
                <span className="text-[10px] text-zinc-500">kcal</span>
              </div>
              <span className="text-[9px] text-zinc-500 block truncate">
                Target: {targets.calories}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70">
              <span className="text-[10px] text-emerald-400/90 font-medium block">Avg Protein</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {stats.avgProtein > 0 ? `${stats.avgProtein}g` : "—"}
                </span>
                <span className="text-[10px] text-zinc-500">/day</span>
              </div>
              <span className="text-[9px] text-zinc-500 block truncate">
                Goal: {targets.proteinGrams}g
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/70">
              <span className="text-[10px] text-zinc-400 font-medium block">Consistency</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono text-zinc-200">
                  {stats.loggedCount}/7
                </span>
                <span className="text-[10px] text-zinc-500">days</span>
              </div>
              <span className="text-[9px] text-zinc-500 block truncate">
                {stats.targetMetDays} on target
              </span>
            </div>
          </div>

          {/* View Tab Selector */}
          <div className="flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => setActiveTab("calories")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "calories"
                  ? "bg-zinc-800 text-emerald-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Calories</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("macros")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "macros"
                  ? "bg-zinc-800 text-emerald-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Macros</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("patterns")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "patterns"
                  ? "bg-zinc-800 text-emerald-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Patterns</span>
            </button>
          </div>

          {/* Tab 1: Calorie Bar Chart */}
          {activeTab === "calories" && (
            <div className="space-y-2">
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekData}
                    margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                      domain={[0, (dataMax: number) => Math.max(dataMax, targets.calories * 1.15)]}
                    />
                    <Tooltip
                      content={<CalorieTooltip targets={targets} />}
                      cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                    />
                    <ReferenceLine
                      y={targets.calories}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        value: `Target: ${targets.calories}`,
                        fill: "#10b981",
                        fontSize: 10,
                        position: "insideTopRight",
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      radius={[4, 4, 0, 0]}
                      onClick={(entry) => onDateSelect?.(entry.dateStr)}
                      className="cursor-pointer"
                    >
                      {weekData.map((entry, index) => {
                        let fill = "#3f3f46"; // default empty/zinc
                        if (entry.calories > 0) {
                          if (entry.status === "perfect") fill = "#10b981"; // emerald on target
                          else if (entry.status === "over") fill = "#f59e0b"; // amber over target
                          else fill = "#6366f1"; // indigo/under target
                        }
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={fill}
                            stroke={entry.isSelected ? "#ffffff" : "transparent"}
                            strokeWidth={entry.isSelected ? 1.5 : 0}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend & Date Selector Pills */}
              <div className="flex items-center justify-between text-[11px] px-1 pt-1 text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    On Target
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Under
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Over
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">Tap bar to inspect day</span>
              </div>
            </div>
          )}

          {/* Tab 2: Macro Breakdown Chart */}
          {activeTab === "macros" && (
            <div className="space-y-2">
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekData}
                    margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="dayLabel"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: "#27272a" }}
                    />
                    <Tooltip
                      content={<MacroTooltip targets={targets} />}
                      cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={28}
                      iconSize={8}
                      formatter={(val: string) => (
                        <span className="text-[10px] text-zinc-300 capitalize">{val} (g)</span>
                      )}
                    />
                    <Bar
                      dataKey="protein"
                      name="Protein"
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="carbs"
                      name="Carbs"
                      fill="#f59e0b"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="fat"
                      name="Fat"
                      fill="#818cf8"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Macro Averages Bar */}
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-around text-xs font-mono">
                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 block font-sans">Avg Protein</span>
                  <span className="font-bold text-emerald-400">{stats.avgProtein}g</span>
                  <span className="text-[9px] text-zinc-500 block font-sans">({stats.proteinPct}%)</span>
                </div>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 block font-sans">Avg Carbs</span>
                  <span className="font-bold text-amber-400">{stats.avgCarbs}g</span>
                  <span className="text-[9px] text-zinc-500 block font-sans">({stats.carbsPct}%)</span>
                </div>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-center">
                  <span className="text-[10px] text-zinc-400 block font-sans">Avg Fat</span>
                  <span className="font-bold text-indigo-400">{stats.avgFat}g</span>
                  <span className="text-[9px] text-zinc-500 block font-sans">({stats.fatPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Pattern Analysis Cards */}
          {activeTab === "patterns" && (
            <div className="space-y-2 pt-1">
              {patterns.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2.5"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.iconType === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {item.iconType === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    {item.iconType === "info" && (
                      <Info className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7-Day Quick Date Navigation Strip */}
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1.5 font-medium">
              Jump to Day
            </span>
            <div className="grid grid-cols-7 gap-1">
              {weekData.map((d) => (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => onDateSelect?.(d.dateStr)}
                  className={`py-1.5 rounded-lg text-center transition flex flex-col items-center ${
                    d.isSelected
                      ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                      : d.isToday
                      ? "bg-zinc-800/90 border border-zinc-700 text-zinc-200"
                      : "bg-zinc-950/50 hover:bg-zinc-800/60 border border-zinc-800/60 text-zinc-400"
                  }`}
                >
                  <span className="text-[9px] font-medium uppercase">{d.dayLabel}</span>
                  <span className="text-[11px] font-bold font-mono">
                    {d.dateStr.split("-")[2]}
                  </span>
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      d.mealCount > 0 ? "bg-emerald-400" : "bg-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Custom Tooltip for Calorie Chart
function CalorieTooltip({ active, payload, targets }: any) {
  if (!active || !payload || !payload.length) return null;
  const data: DayData = payload[0].payload;
  const diff = data.calories - targets.calories;

  return (
    <div className="bg-zinc-900/95 border border-zinc-700 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
      <p className="font-semibold text-zinc-100">{data.fullDateLabel}</p>
      <div className="mt-1 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Calories:</span>
          <span className="font-mono font-bold text-zinc-100">{data.calories} kcal</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Target:</span>
          <span className="font-mono text-zinc-400">{targets.calories} kcal</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-1">
          <span className="text-zinc-400">Difference:</span>
          <span
            className={`font-mono font-semibold ${
              Math.abs(diff) <= targets.calories * 0.1
                ? "text-emerald-400"
                : diff > 0
                ? "text-amber-400"
                : "text-indigo-400"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff} kcal
          </span>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Macro Chart
function MacroTooltip({ active, payload, targets }: any) {
  if (!active || !payload || !payload.length) return null;
  const data: DayData = payload[0].payload;

  return (
    <div className="bg-zinc-900/95 border border-zinc-700 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md min-w-32">
      <p className="font-semibold text-zinc-100">{data.fullDateLabel}</p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-3 text-emerald-400">
          <span>Protein:</span>
          <span className="font-mono font-semibold">
            {data.protein}g <span className="text-zinc-500 font-normal">/ {targets.proteinGrams}g</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-amber-400">
          <span>Carbs:</span>
          <span className="font-mono font-semibold">
            {data.carbs}g <span className="text-zinc-500 font-normal">/ {targets.carbsGrams}g</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-indigo-400">
          <span>Fat:</span>
          <span className="font-mono font-semibold">
            {data.fat}g <span className="text-zinc-500 font-normal">/ {targets.fatGrams}g</span>
          </span>
        </div>
      </div>
    </div>
  );
}
