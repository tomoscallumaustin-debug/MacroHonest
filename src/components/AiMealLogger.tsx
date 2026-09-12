import React, { useState, useRef } from "react";
import {
  Camera,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Pencil,
  Plus,
  Loader2,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  AiAnalysisResult,
  ConfidenceScore,
  FoodItemBreakdown,
  LoggedMeal,
  MealType,
} from "../types";
import { TranslationStrings } from "../utils/translations";
import { analyzeMeal } from "../services/aiService";
import {
  extractCleanErrorMessage,
  estimateMealNutrientsHeuristically,
} from "../utils/nutritionEstimator";

interface AiMealLoggerProps {
  selectedDate: string;
  onMealLogged: (meal: LoggedMeal) => void;
  externalPrompt?: string;
  t: TranslationStrings;
}

export const AiMealLogger: React.FC<AiMealLoggerProps> = ({
  selectedDate,
  onMealLogged,
  externalPrompt,
  t,
}) => {
  const [mealText, setMealText] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");

  React.useEffect(() => {
    if (externalPrompt) {
      setMealText(externalPrompt);
    }
  }, [externalPrompt]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Manual editing overrides for the AI result
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFat, setEditFat] = useState<number>(0);

  // Manual fallback mode if user explicitly chooses or if AI fails
  const [isManualMode, setIsManualMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample meals for instant 1-click test
  const sampleMeals = [
    {
      label: "🍳 2 eggs & avocado sourdough",
      prompt: "2 large poached eggs on whole wheat sourdough with 1/2 sliced avocado and pinch of salt",
      type: "breakfast" as MealType,
    },
    {
      label: "🥗 Grilled salmon nourish bowl",
      prompt: "150g grilled wild salmon fillet, 1 cup cooked quinoa, steamed broccoli, and 1 tbsp lemon vinaigrette",
      type: "lunch" as MealType,
    },
    {
      label: "🥣 Greek yogurt & berries",
      prompt: "1 cup 0% plain Greek yogurt, 1/2 cup fresh blueberries, and 1 tbsp raw honey",
      type: "snack" as MealType,
    },
  ];

  // Handle image upload from file or camera
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Perform AI analysis via Express backend
  const handleAnalyzeMeal = async (customPrompt?: string, customType?: MealType) => {
    const promptToUse = customPrompt || mealText;
    const typeToUse = customType || mealType;

    if (!promptToUse.trim() && !imagePreview) {
      setAnalysisError("Please enter a meal description or select a photo.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const data = await analyzeMeal({
        text: promptToUse.trim() || undefined,
        imageBase64: imagePreview || undefined,
        mimeType: imageMime,
      });

      setAnalysisResult(data);
      setEditName(data.mealName);
      setEditCalories(data.totalCalories);
      setEditProtein(data.proteinGrams);
      setEditCarbs(data.carbsGrams);
      setEditFat(data.fatGrams);
      setMealType(typeToUse);
    } catch (err: any) {
      console.error("AI analysis error:", err?.message || err);
      const cleanMsg = extractCleanErrorMessage(err);
      setAnalysisError(cleanMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Instant heuristic estimate when AI is temporarily congested
  const handleInstantEstimate = () => {
    if (!mealText.trim()) return;
    const estimate = estimateMealNutrientsHeuristically(mealText.trim());
    setAnalysisResult(estimate);
    setEditName(estimate.mealName);
    setEditCalories(estimate.totalCalories);
    setEditProtein(estimate.proteinGrams);
    setEditCarbs(estimate.carbsGrams);
    setEditFat(estimate.fatGrams);
    setAnalysisError(null);
  };

  // Save the analyzed or edited meal to daily log
  const handleSaveMeal = () => {
    if (!analysisResult && !isManualMode) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const mealToSave: LoggedMeal = {
      id: `meal-${Date.now()}`,
      date: selectedDate,
      time: currentTime,
      mealType,
      name: isEditing || isManualMode ? editName : analysisResult?.mealName || editName,
      calories: Math.max(
        0,
        isEditing || isManualMode ? editCalories : analysisResult?.totalCalories || 0
      ),
      proteinGrams: Math.max(
        0,
        isEditing || isManualMode ? editProtein : analysisResult?.proteinGrams || 0
      ),
      carbsGrams: Math.max(
        0,
        isEditing || isManualMode ? editCarbs : analysisResult?.carbsGrams || 0
      ),
      fatGrams: Math.max(
        0,
        isEditing || isManualMode ? editFat : analysisResult?.fatGrams || 0
      ),
      confidenceScore: analysisResult?.confidenceScore,
      confidenceReason: analysisResult?.confidenceReason,
      honestTip: analysisResult?.honestTip,
      items: analysisResult?.items,
      photoUrl: imagePreview || undefined,
      loggedVia: isManualMode
        ? "manual"
        : imagePreview
        ? "ai_photo"
        : "ai_text",
    };

    onMealLogged(mealToSave);

    // Reset form
    setMealText("");
    setImagePreview(null);
    setAnalysisResult(null);
    setIsEditing(false);
    setIsManualMode(false);
  };

  // Open manual entry prefilled or blank
  const startManualMode = (defaultName = "") => {
    setIsManualMode(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setEditName(defaultName || mealText || "Custom Meal");
    setEditCalories(450);
    setEditProtein(30);
    setEditCarbs(45);
    setEditFat(15);
  };

  const getConfidenceBadgeColor = (conf?: ConfidenceScore) => {
    switch (conf) {
      case "High":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Medium":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Estimated":
      default:
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
    }
  };

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
      {/* Title & Meal Type Picker */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">
            {t.logMealTitle}
          </h2>
        </div>

        {/* Meal Type Pills */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMealType(type)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition capitalize ${
                mealType === type
                  ? "bg-zinc-800 text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Box */}
      {!analysisResult && !isManualMode && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              placeholder={t.aiPromptPlaceholder}
              rows={2}
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 resize-none transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAnalyzeMeal();
                }
              }}
            />
          </div>

          {/* Photo Attachment Preview */}
          {imagePreview && (
            <div className="relative inline-block rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950">
              <img
                src={imagePreview}
                alt="Meal preview"
                className="h-24 w-24 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 p-1 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 rounded-full transition"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
                id="food-photo-upload"
              />
              <label
                htmlFor="food-photo-upload"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 cursor-pointer transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{imagePreview ? "Change Photo" : t.takeOrUploadPhoto}</span>
              </label>

              <button
                type="button"
                onClick={() => startManualMode(mealText)}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4 py-2 px-1 transition"
              >
                {t.enterManually}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAnalyzeMeal()}
              disabled={isAnalyzing || (!mealText.trim() && !imagePreview)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {/* Error notice & instant fallback */}
          {analysisError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-amber-200 leading-relaxed">{analysisError}</p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleAnalyzeMeal()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Try again
                  </button>
                  {mealText.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={handleInstantEstimate}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium transition"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Quick Estimate (Offline)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startManualMode(mealText)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-zinc-200 font-medium transition"
                  >
                    <Plus className="w-3 h-3" />
                    Manual entry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick 1-Click Samples */}
          <div className="pt-2 border-t border-zinc-800/50">
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1.5">
              {t.sampleMeals}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleMeals.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMealText(sample.prompt);
                    setMealType(sample.type);
                    handleAnalyzeMeal(sample.prompt, sample.type);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-zinc-100 transition text-left"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transparent AI Analysis Result View */}
      {analysisResult && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-300">
          {/* Header with Meal Name & Confidence Badge */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-100">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded text-zinc-100 text-sm font-semibold"
                    />
                  ) : (
                    analysisResult.mealName
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-zinc-400 hover:text-zinc-200 transition"
                  title="Edit meal values"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-zinc-400 capitalize">
                {t[mealType]} • {selectedDate}
              </span>
            </div>

            {/* Confidence Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${getConfidenceBadgeColor(
                analysisResult.confidenceScore
              )}`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>
                {analysisResult.confidenceScore === "High"
                  ? t.confHigh
                  : analysisResult.confidenceScore === "Medium"
                  ? t.confMedium
                  : t.confEstimated}
              </span>
            </div>
          </div>

          {/* Transparent Confidence Reason & Honest Tip */}
          <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60 text-xs">
            <div className="flex items-start gap-1.5 text-zinc-300">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200">
                  {t.confidenceReason}:{" "}
                </span>
                <span className="text-zinc-400">
                  {analysisResult.confidenceReason}
                </span>
              </div>
            </div>
            {analysisResult.honestTip && (
              <div className="flex items-start gap-1.5 text-amber-300/90 pt-1.5 border-t border-zinc-800/40">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">
                    {t.honestNote}:{" "}
                  </span>
                  <span className="text-zinc-400">
                    {analysisResult.honestTip}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Macro Stats Grid (with 1-click edit inputs if editing) */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 font-medium uppercase block mb-0.5">
                {t.calories}
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={editCalories}
                  onChange={(e) => setEditCalories(Number(e.target.value))}
                  className="w-full text-center bg-zinc-900 border border-zinc-700 rounded px-1 text-sm font-bold text-zinc-100 font-mono"
                />
              ) : (
                <span className="text-sm font-extrabold text-zinc-100 font-mono">
                  {editCalories}
                </span>
              )}
              <span className="text-[9px] text-zinc-500 block">kcal</span>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
              <span className="text-[10px] text-emerald-400 font-medium uppercase block mb-0.5">
                {t.protein}
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={editProtein}
                  onChange={(e) => setEditProtein(Number(e.target.value))}
                  className="w-full text-center bg-zinc-900 border border-zinc-700 rounded px-1 text-sm font-bold text-emerald-300 font-mono"
                />
              ) : (
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {editProtein}g
                </span>
              )}
              <span className="text-[9px] text-zinc-500 block">
                {Math.round(editProtein * 4)} kcal
              </span>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
              <span className="text-[10px] text-amber-400 font-medium uppercase block mb-0.5">
                {t.carbs}
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={editCarbs}
                  onChange={(e) => setEditCarbs(Number(e.target.value))}
                  className="w-full text-center bg-zinc-900 border border-zinc-700 rounded px-1 text-sm font-bold text-amber-300 font-mono"
                />
              ) : (
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {editCarbs}g
                </span>
              )}
              <span className="text-[9px] text-zinc-500 block">
                {Math.round(editCarbs * 4)} kcal
              </span>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 text-center">
              <span className="text-[10px] text-sky-400 font-medium uppercase block mb-0.5">
                {t.fat}
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={editFat}
                  onChange={(e) => setEditFat(Number(e.target.value))}
                  className="w-full text-center bg-zinc-900 border border-zinc-700 rounded px-1 text-sm font-bold text-sky-300 font-mono"
                />
              ) : (
                <span className="text-sm font-extrabold text-sky-400 font-mono">
                  {editFat}g
                </span>
              )}
              <span className="text-[9px] text-zinc-500 block">
                {Math.round(editFat * 9)} kcal
              </span>
            </div>
          </div>

          {/* Itemized Sub-components Breakdown */}
          {analysisResult.items && analysisResult.items.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide block mb-1.5">
                {t.itemizedBreakdown}
              </span>
              <div className="space-y-1.5">
                {analysisResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/60 text-xs"
                  >
                    <div>
                      <span className="font-medium text-zinc-200">{item.name}</span>
                      <span className="text-[11px] text-zinc-500 ml-1.5">
                        ({item.portion})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                      <span className="text-zinc-200 font-semibold">
                        {item.calories} kcal
                      </span>
                      <span>P:{item.proteinGrams}g</span>
                      <span>C:{item.carbsGrams}g</span>
                      <span>F:{item.fatGrams}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions: Save or Cancel */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setAnalysisResult(null);
                setIsEditing(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveMeal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.saveToDailyLog}</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Mode Form */}
      {isManualMode && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">
              {t.manualFallbackTitle}
            </h3>
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Meal Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Ribeye Steak & Sweet Potato"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-medium text-zinc-400 block mb-1">
                {t.calories}
              </label>
              <input
                type="number"
                value={editCalories}
                onChange={(e) => setEditCalories(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-emerald-400 block mb-1">
                {t.protein} (g)
              </label>
              <input
                type="number"
                value={editProtein}
                onChange={(e) => setEditProtein(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-amber-400 block mb-1">
                {t.carbs} (g)
              </label>
              <input
                type="number"
                value={editCarbs}
                onChange={(e) => setEditCarbs(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-sky-400 block mb-1">
                {t.fat} (g)
              </label>
              <input
                type="number"
                value={editFat}
                onChange={(e) => setEditFat(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveMeal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.saveToDailyLog}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
