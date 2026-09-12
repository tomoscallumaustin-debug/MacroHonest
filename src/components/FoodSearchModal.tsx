import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  Plus,
  X,
  Scale,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { VERIFIED_FOODS } from "../data/foodDatabase";
import { LoggedMeal, MealType, VerifiedFood } from "../types";
import { TranslationStrings } from "../utils/translations";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onFoodAdded: (meal: LoggedMeal) => void;
  t: TranslationStrings;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onFoodAdded,
  t,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFood, setSelectedFood] = useState<VerifiedFood | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [mealType, setMealType] = useState<MealType>("lunch");

  // Custom food creator state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCals, setCustomCals] = useState(100);
  const [customProtein, setCustomProtein] = useState(10);
  const [customCarbs, setCustomCarbs] = useState(10);
  const [customFat, setCustomFat] = useState(2);
  const [customServing, setCustomServing] = useState("100g");

  // Filtered food list
  const filteredFoods = useMemo(() => {
    return VERIFIED_FOODS.filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  // Macro calculation based on selected food & custom portion grams
  const computedMacros = selectedFood
    ? {
        calories: Math.round(
          (selectedFood.caloriesPer100g * portionGrams) / 100
        ),
        protein: Math.round(
          (selectedFood.proteinPer100g * portionGrams) / 100
        ),
        carbs: Math.round((selectedFood.carbsPer100g * portionGrams) / 100),
        fat: Math.round((selectedFood.fatPer100g * portionGrams) / 100),
      }
    : null;

  const handleSelectFood = (food: VerifiedFood) => {
    setSelectedFood(food);
    setPortionGrams(food.servingSizeGrams || 100);
  };

  const handleLogSelectedFood = () => {
    if (!selectedFood || !computedMacros) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newMeal: LoggedMeal = {
      id: `food-${Date.now()}`,
      date: selectedDate,
      time: currentTime,
      mealType,
      name: selectedFood.name,
      calories: computedMacros.calories,
      proteinGrams: computedMacros.protein,
      carbsGrams: computedMacros.carbs,
      fatGrams: computedMacros.fat,
      confidenceScore: "High",
      confidenceReason: `Verified USDA database entry (${portionGrams}g).`,
      items: [
        {
          name: selectedFood.name,
          portion: `${portionGrams}g`,
          calories: computedMacros.calories,
          proteinGrams: computedMacros.protein,
          carbsGrams: computedMacros.carbs,
          fatGrams: computedMacros.fat,
        },
      ],
      loggedVia: "database",
    };

    onFoodAdded(newMeal);
    setSelectedFood(null);
    onClose();
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newMeal: LoggedMeal = {
      id: `custom-${Date.now()}`,
      date: selectedDate,
      time: currentTime,
      mealType,
      name: customName.trim(),
      calories: Number(customCals) || 0,
      proteinGrams: Number(customProtein) || 0,
      carbsGrams: Number(customCarbs) || 0,
      fatGrams: Number(customFat) || 0,
      confidenceScore: "High",
      confidenceReason: `Custom verified entry (${customServing}).`,
      loggedVia: "manual",
    };

    onFoodAdded(newMeal);
    setShowCustomForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              {t.foodDatabaseTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Custom food toggle button */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              {showCustomForm ? "Create custom item" : "Browse verified whole foods"}
            </span>
            <button
              type="button"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {showCustomForm ? "Back to Search" : t.addCustomFoodTitle}
            </button>
          </div>

          {showCustomForm ? (
            /* Custom Food Form */
            <form onSubmit={handleSaveCustomFood} className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Homemade Sourdough Loaf"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    placeholder="e.g. 1 slice (60g)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Meal Type
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 capitalize"
                  >
                    <option value="breakfast">{t.breakfast}</option>
                    <option value="lunch">{t.lunch}</option>
                    <option value="dinner">{t.dinner}</option>
                    <option value="snack">{t.snack}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    {t.calories}
                  </label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">
                    {t.protein} (g)
                  </label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-amber-400 block mb-1">
                    {t.carbs} (g)
                  </label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-sky-400 block mb-1">
                    {t.fat} (g)
                  </label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition"
              >
                Save & Add to Log
              </button>
            </form>
          ) : (
            /* Database Search List */
            <>
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchDatabasePlaceholder}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: "all", label: t.allCategories },
                  { id: "protein", label: "Protein" },
                  { id: "carbs", label: "Carbs & Grains" },
                  { id: "fats", label: "Fats & Nuts" },
                  { id: "produce", label: "Produce" },
                  { id: "dairy", label: "Dairy" },
                  { id: "snacks", label: "Snacks" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition ${
                      selectedCategory === cat.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Food Items List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                        isSelected
                          ? "bg-zinc-800/90 border-emerald-500/60 shadow-xs"
                          : "bg-zinc-950/40 border-zinc-800/60 hover:bg-zinc-950/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-100">
                            {food.name}
                          </span>
                          <span className="text-[10px] text-emerald-400/90 font-medium">
                            ✓
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {food.servingName} • {food.verifiedSource}
                        </span>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="font-bold text-zinc-200">
                          {food.caloriesPer100g} kcal
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          P:{food.proteinPer100g} C:{food.carbsPer100g} F:{food.fatPer100g}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Food Custom Portion & Add Section */}
              {selectedFood && computedMacros && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">
                        {selectedFood.name}
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        {selectedFood.verifiedSource}
                      </span>
                    </div>
                    {/* Meal type selector */}
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealType)}
                      className="bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-200 rounded-lg px-2 py-1 capitalize"
                    >
                      <option value="breakfast">{t.breakfast}</option>
                      <option value="lunch">{t.lunch}</option>
                      <option value="dinner">{t.dinner}</option>
                      <option value="snack">{t.snack}</option>
                    </select>
                  </div>

                  {/* Portion Grams Adjuster */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5" />
                        Serving Size:
                      </span>
                      <span className="font-bold font-mono text-zinc-200">
                        {portionGrams} grams
                      </span>
                    </div>

                    {/* Quick Gram Presets */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {[50, 100, 150, 200, selectedFood.servingSizeGrams].map(
                        (grams, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPortionGrams(grams)}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono transition ${
                              portionGrams === grams
                                ? "bg-emerald-500 text-zinc-950 font-bold"
                                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {grams}g
                          </button>
                        )
                      )}
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={5}
                      value={portionGrams}
                      onChange={(e) => setPortionGrams(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Calculated Macro Summary */}
                  <div className="grid grid-cols-4 gap-1.5 text-center bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">
                        {t.calories}
                      </span>
                      <span className="text-xs font-bold text-zinc-100 font-mono">
                        {computedMacros.calories}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block">
                        {t.protein}
                      </span>
                      <span className="text-xs font-bold text-emerald-300 font-mono">
                        {computedMacros.protein}g
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 block">
                        {t.carbs}
                      </span>
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {computedMacros.carbs}g
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-sky-400 block">
                        {t.fat}
                      </span>
                      <span className="text-xs font-bold text-sky-300 font-mono">
                        {computedMacros.fat}g
                      </span>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleLogSelectedFood}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addToLog}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
