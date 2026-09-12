import React from "react";
import {
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Zap,
  Lock,
  Download,
  EyeOff,
  Heart,
} from "lucide-react";
import { UserSettings } from "../types";
import { TranslationStrings } from "../utils/translations";

interface HonestPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  t: TranslationStrings;
}

export const HonestPricingModal: React.FC<HonestPricingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  t,
}) => {
  if (!isOpen) return null;

  const toggleSupporter = (tier: "lifetime" | "monthly") => {
    if (settings.isSupporter && settings.supporterTier === tier) {
      // Toggle off for testing
      onUpdateSettings({
        ...settings,
        isSupporter: false,
        supporterTier: "free",
      });
    } else {
      onUpdateSettings({
        ...settings,
        isSupporter: true,
        supporterTier: tier,
        supporterSince: new Date().toLocaleDateString(),
      });
    }
  };

  const comparisonRows = [
    {
      feature: "Subscription traps & sneaky 7-day auto-rebills",
      predator: "Common ($79.99/yr surprise charge)",
      macroHonest: "Never. Clear upfront terms.",
    },
    {
      feature: "Cancellation process",
      predator: "14-page guilt survey + hidden support email",
      macroHonest: "1 single click. Instant stop.",
    },
    {
      feature: "Lifetime purchase option",
      predator: "Hidden or impossible ($250+)",
      macroHonest: "Honest $29 one-time lifetime tier.",
    },
    {
      feature: "Intrusive video ads & popups",
      predator: "Full-screen video ads after logging food",
      macroHonest: "Zero ads. Snappy and calm.",
    },
    {
      feature: "AI Calorie Transparency",
      predator: "Opaque single number with no explanation",
      macroHonest: "Confidence score & ingredient breakdown.",
    },
    {
      feature: "Your nutritional data ownership",
      predator: "Trapped in walled garden / sold to brokers",
      macroHonest: "100% local-first. Export JSON/CSV anytime.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                {t.honestPricingTitle}
              </h2>
              <p className="text-[10px] text-zinc-400">
                Zero dark patterns. Zero surprises.
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

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Prominent Badge Mandate */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-300 block">
                {t.noDarkPatternsBadge}
              </span>
              <span className="text-[11px] text-zinc-400">
                {t.cancelAnytimeBadge}
              </span>
            </div>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Lifetime Plan */}
            <div
              className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                settings.isSupporter && settings.supporterTier === "lifetime"
                  ? "bg-emerald-950/40 border-emerald-500 shadow-md"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-zinc-950 uppercase">
                Most Honest
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-300 block">
                  {t.lifetimeAccess}
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-black text-zinc-100 font-mono">
                    $29
                  </span>
                  <span className="text-[10px] text-zinc-400">once</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  {t.oneTimePayment}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSupporter("lifetime")}
                className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
                  settings.isSupporter && settings.supporterTier === "lifetime"
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
              >
                {settings.isSupporter && settings.supporterTier === "lifetime"
                  ? "✓ Active Supporter"
                  : "Select Lifetime"}
              </button>
            </div>

            {/* Fair Monthly */}
            <div
              className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                settings.isSupporter && settings.supporterTier === "monthly"
                  ? "bg-emerald-950/40 border-emerald-500 shadow-md"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-zinc-300 block">
                  {t.fairMonthly}
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-black text-zinc-100 font-mono">
                    $2.99
                  </span>
                  <span className="text-[10px] text-zinc-400">/ mo</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  {t.monthlyFee}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSupporter("monthly")}
                className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
                  settings.isSupporter && settings.supporterTier === "monthly"
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                }`}
              >
                {settings.isSupporter && settings.supporterTier === "monthly"
                  ? "✓ Active Monthly"
                  : "Select Monthly"}
              </button>
            </div>
          </div>

          {/* Supporter status badge confirmation */}
          {settings.isSupporter && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span className="text-emerald-300 font-medium">
                  Thank you for keeping MacroHonest independent!
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    isSupporter: false,
                    supporterTier: "free",
                  })
                }
                className="text-[10px] text-zinc-400 hover:text-zinc-200 underline"
              >
                Reset to Free
              </button>
            </div>
          )}

          {/* Anti-Predator Comparison Table */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider mb-2">
              {t.honestComparisonTitle}
            </h3>
            <div className="space-y-2 text-xs">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-1"
                >
                  <span className="font-semibold text-zinc-200 block text-[11px]">
                    {row.feature}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-800/40">
                    <div className="text-rose-400/80 flex items-start gap-1">
                      <span className="shrink-0">✕</span>
                      <span>{row.predator}</span>
                    </div>
                    <div className="text-emerald-400 font-medium flex items-start gap-1">
                      <span className="shrink-0">✓</span>
                      <span>{row.macroHonest}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manifest Note */}
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-300 block mb-1">
              Our Honest Promise:
            </span>
            We believe tracking what you put into your body should feel clean and
            reassuring, not like navigating a timeshare sales pitch. No 15-question
            surveys to cancel, no trial trapdoors, and no selling your personal
            nutritional logs to insurance advertisers.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Encrypted & local-first
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
