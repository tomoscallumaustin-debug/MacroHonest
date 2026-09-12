import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Calculator,
  TrendingUp,
  Droplets,
  Search,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  HelpCircle,
} from "lucide-react";
import { TranslationStrings } from "../utils/translations";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onOpenSearch: () => void;
  onOpenCoach: () => void;
  onSampleMealSelect?: (sampleText: string) => void;
  t: TranslationStrings;
}

interface GuideStep {
  stepNumber: number;
  badge: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  highlightPills: string[];
  demoContent: React.ReactNode;
}

export function WelcomeModal({
  isOpen,
  onClose,
  onOpenGuide,
  onOpenSearch,
  onOpenCoach,
  onSampleMealSelect,
  t,
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: GuideStep[] = [
    {
      stepNumber: 1,
      badge: "Fast AI Logging",
      title: "Log Food In Plain Words or Snap a Plate",
      tagline: "No manual searching through 50 brands to find an egg",
      icon: Sparkles,
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
      iconColor: "text-emerald-400",
      description:
        "Just describe what you ate in natural English, Spanish, French, or German. Or take a photo with your phone camera. Gemini calculates calories and macros with honest confidence ratings.",
      highlightPills: [
        "Natural text parsing",
        "Camera & photo support",
        "Transparent confidence rating",
        "Itemized ingredient breakdown",
      ],
      demoContent: (
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-emerald-300">Example Input:</span>
          </div>
          <p className="text-xs text-zinc-200 italic bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
            "2 scrambled eggs with half an avocado and 1 slice of sourdough toast"
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
            <span className="text-emerald-300 font-bold">~385 kcal</span>
            <span className="text-zinc-400">18g P • 28g C • 22g F</span>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 2,
      badge: "Science-Backed Targets",
      title: "Auto-Calculate Your Calories & Macros",
      tagline: "Based on the Mifflin-St Jeor equation, not arbitrary guesswork",
      icon: Calculator,
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
      iconColor: "text-emerald-400",
      description:
        "Input your age, gender, height, weight, activity level, and goal (fat loss, maintenance, or muscle gain). MacroHonest tailors your daily calories and ensures protein is prioritized for satiety and lean tissue.",
      highlightPills: [
        "TDEE & BMR estimation",
        "Fat loss deficit safety limits",
        "Custom protein distribution",
        "Live progress rings",
      ],
      demoContent: (
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">Daily Target</span>
              <span className="font-bold text-zinc-100 font-mono">2,150</span>
              <span className="text-[9px] text-zinc-500 block">kcal</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] text-emerald-400 block">Protein Target</span>
              <span className="font-bold text-emerald-300 font-mono">160g</span>
              <span className="text-[9px] text-zinc-500 block">optimal</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-[10px] text-amber-400 block">Strategy</span>
              <span className="font-bold text-amber-300 font-mono">Slow Cut</span>
              <span className="text-[9px] text-zinc-500 block">sustainable</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
            className="w-full py-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition"
          >
            Launch Calorie Guide Calculator →
          </button>
        </div>
      ),
    },
    {
      stepNumber: 3,
      badge: "Trends & Hydration",
      title: "Weekly Insights & 1-Tap Water Logging",
      tagline: "Spot patterns across 7 days to stay consistent without burnout",
      icon: TrendingUp,
      iconBg: "bg-indigo-500/15 border-indigo-500/30",
      iconColor: "text-indigo-400",
      description:
        "The new Weekly Insights chart visualizes your caloric balance and macro consistency across the last 7 days. It automatically flags weekend surplus patterns, protein compliance, and hydration levels.",
      highlightPills: [
        "7-day Recharts visualizer",
        "Weekend vs weekday patterns",
        "1-tap +250ml water tracking",
        "Click any day to inspect meals",
      ],
      demoContent: (
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">7-Day Consistency</span>
            <span className="text-emerald-400 font-mono font-bold">5 of 7 Days On Target</span>
          </div>
          <div className="flex gap-1 items-end h-10 pt-1">
            {[65, 80, 75, 90, 85, 95, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-t transition"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Tap +250ml or +500ml water buttons anytime to log hydration!</span>
          </div>
        </div>
      ),
    },
    {
      stepNumber: 4,
      badge: "Honest Guarantee",
      title: "Zero Bloat, Zero Ads, 100% Local-First",
      tagline: "Your data stays in your browser. No subscription traps.",
      icon: ShieldCheck,
      iconBg: "bg-amber-500/15 border-amber-500/30",
      iconColor: "text-amber-400",
      description:
        "Traditional calorie apps are cluttered with 30-second video ads, locked barcode scanners, and dark-pattern recurring fees. MacroHonest gives you full unconstrained tracking, offline fallback estimation, and free CSV/JSON export.",
      highlightPills: [
        "No forced account signups",
        "Instant offline estimation fallback",
        "USDA verified whole-food search",
        "AI Macro Coach for meal swaps",
      ],
      demoContent: (
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-zinc-200 block text-[11px]">AI Coach</span>
                <span className="text-[10px] text-zinc-400">Ask for protein swaps</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-zinc-200 block text-[11px]">USDA Search</span>
                <span className="text-[10px] text-zinc-400">Verified raw foods</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 text-center">
            Tap the <span className="text-zinc-200 font-semibold">?</span> icon in the top bar whenever you want to revisit this guide.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              MH
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Welcome to MacroHonest</span>
              </h2>
              <span className="text-[10px] text-zinc-400">
                Quick 4-step walkthrough
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            aria-label="Close welcome guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex px-4 pt-3 pb-1 gap-1.5 border-b border-zinc-800/50 bg-zinc-950/40">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-1 text-center rounded-lg transition text-[10px] font-semibold flex items-center justify-center gap-1 ${
                idx === currentStep
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : idx < currentStep
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-zinc-900 text-zinc-500"
              }`}
            >
              <span>{idx + 1}</span>
              <span className="hidden sm:inline">{s.badge}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Card Title & Icon */}
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${current.iconBg}`}
            >
              <current.icon className={`w-5 h-5 ${current.iconColor}`} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Step {current.stepNumber} of 4 • {current.badge}
              </span>
              <h3 className="text-base font-bold text-zinc-100 leading-snug">
                {current.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{current.tagline}</p>
            </div>
          </div>

          {/* Interactive Demo / Visual Preview */}
          {current.demoContent}

          {/* Detailed Description */}
          <p className="text-xs text-zinc-300 leading-relaxed">
            {current.description}
          </p>

          {/* Feature Highlight Pills */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {current.highlightPills.map((pill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-[11px] text-zinc-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{pill}</span>
              </div>
            ))}
          </div>

          {/* Special Quick Action for Step 1 */}
          {currentStep === 0 && onSampleMealSelect && (
            <div className="pt-2 border-t border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1.5">
                Try a 1-click sample right now:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "3 scrambled eggs with spinach and whole grain toast",
                  "Grilled chicken breast bowl with brown rice and broccoli",
                  "Greek yogurt with blueberries, chia seeds, and honey",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSampleMealSelect(sample);
                      onClose();
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="truncate max-w-[240px]">{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-2">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition"
            >
              Skip Tour
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-98"
            >
              <span>{isLastStep ? "Get Started Tracking" : "Next Step"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
