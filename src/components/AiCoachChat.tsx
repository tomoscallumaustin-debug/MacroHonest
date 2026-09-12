import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Lightbulb,
  Zap,
  HelpCircle,
  Flame,
  ShieldCheck,
  RotateCcw,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { ChatMessage, LoggedMeal, MacroTargets } from "../types";
import { TranslationStrings } from "../utils/translations";
import { sendCoachChat } from "../services/aiService";

interface ExtendedChatMessage extends ChatMessage {
  photoPreview?: string;
}

interface AiCoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  targets: MacroTargets;
  meals: LoggedMeal[];
  t: TranslationStrings;
}

export const AiCoachChat: React.FC<AiCoachChatProps> = ({
  isOpen,
  onClose,
  selectedDate,
  targets,
  meals,
  t,
}) => {
  // Current day nutritional summary
  const consumed = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.proteinGrams,
      carbs: acc.carbs + m.carbsGrams,
      fat: acc.fat + m.fatGrams,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.proteinGrams - consumed.protein),
    carbs: Math.max(0, targets.carbsGrams - consumed.carbs),
    fat: Math.max(0, targets.fatGrams - consumed.fat),
  };

  // Initial welcome message
  const initialWelcome = `Hey there! I'm your MacroHonest Coach. 

Right now on **${selectedDate}**, you've logged **${consumed.calories} / ${targets.calories} kcal** with **${remaining.calories} kcal remaining** (P: ${remaining.protein}g, C: ${remaining.carbs}g, F: ${remaining.fat}g).

How can I help today? You can ask for meal ideas that fit your exact remaining macros, ingredient swaps, plateau troubleshooting, or practical nutrition advice!`;

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: initialWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<{
    base64: string;
    mimeType: string;
    preview: string;
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mimeType = file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAttachedPhoto({
        base64: result,
        mimeType,
        preview: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: "What to eat with remaining macros?",
      prompt: `Based on my exact remaining numbers today (${remaining.calories} kcal, ${remaining.protein}g protein, ${remaining.carbs}g carbs, ${remaining.fat}g fat), what are 2-3 realistic meal or snack options I can prepare?`,
    },
    {
      label: "How to break a weight plateau?",
      prompt: "I've been stuck at the same scale weight for 3 weeks while consistently tracking. What are the most common scientific reasons and honest adjustments to make?",
    },
    {
      label: "Easy high-protein snack swaps",
      prompt: "Give me 4 simple, high-protein snack ideas under 200 calories that require almost zero prep time.",
    },
    {
      label: "Healthy dining out strategy",
      prompt: "What is an honest, low-stress strategy for estimating restaurant meals with hidden cooking oils without getting anxious about macros?",
    },
  ];

  const handleSendMessage = async (userText: string) => {
    if ((!userText.trim() && !attachedPhoto) || isTyping) return;

    const promptText = userText.trim() || (attachedPhoto ? "Can you analyze this food photo and tell me if it fits my remaining macros?" : "");

    const userMsg: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: promptText,
      photoPreview: attachedPhoto?.preview,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    const currentPhoto = attachedPhoto;
    setAttachedPhoto(null);
    setIsTyping(true);

    try {
      const result = await sendCoachChat({
        messages: newMessages,
        currentContext: {
          date: selectedDate,
          targets,
          consumed,
          remaining,
          loggedMealsToday: meals.map((m) => ({
            name: m.name,
            calories: m.calories,
            proteinGrams: m.proteinGrams,
            carbsGrams: m.carbsGrams,
            fatGrams: m.fatGrams,
          })),
        },
        attachedPhotoBase64: currentPhoto?.base64,
        attachedPhotoMime: currentPhoto?.mimeType,
      });

      const assistantMsg: ExtendedChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error(error);
      const errorReply: ExtendedChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content:
          "I'm here to support you! Remember: hitting your daily protein target and maintaining sustainable consistency is 90% of the battle. Feel free to ask anything about your macros or meals.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: initialWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[720px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-zinc-100">AI Macro Coach</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Grounded in your real-time daily progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Context Banner */}
        <div className="bg-zinc-950/80 px-3.5 py-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] shrink-0">
          <span className="text-zinc-400">
            Remaining Today:{" "}
            <strong className="text-zinc-100 font-mono">
              {remaining.calories} kcal
            </strong>
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-emerald-400 font-bold">P: {remaining.protein}g</span>
            <span className="text-amber-400 font-bold">C: {remaining.carbs}g</span>
            <span className="text-sky-400 font-bold">F: {remaining.fat}g</span>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-2 text-xs leading-relaxed ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                    isUser
                      ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-xs"
                      : "bg-zinc-950/80 text-zinc-200 border border-zinc-800/80 rounded-tl-xs"
                  }`}
                >
                  {msg.photoPreview && (
                    <div className="rounded-xl overflow-hidden border border-black/20 max-w-[200px] max-h-[160px]">
                      <img
                        src={msg.photoPreview}
                        alt="Attached food"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span
                    className={`block text-[9px] text-right ${
                      isUser ? "text-zinc-800/80" : "text-zinc-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-zinc-400 pl-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-zinc-400 text-xs">
                Thinking honestly...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3.5 py-1.5 bg-zinc-950/40 border-t border-zinc-800/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.prompt)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 shrink-0 transition hover:text-emerald-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Staged Photo Attachment Preview */}
        {attachedPhoto && (
          <div className="px-3.5 pt-2 pb-1 bg-zinc-900 flex items-center gap-2 border-t border-zinc-800/60">
            <div className="relative inline-block rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950">
              <img
                src={attachedPhoto.preview}
                alt="Staged photo"
                className="w-12 h-12 object-cover"
              />
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 hover:bg-black text-zinc-300 rounded-full transition"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <span className="text-[11px] text-zinc-400">
              Food photo attached for visual AI coaching
            </span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition active:scale-95 shrink-0"
              title="Attach food photo or label"
              aria-label="Attach photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={attachedPhoto ? "Ask about this photo or leave blank..." : "Ask your coach anything about nutrition..."}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={(!inputMessage.trim() && !attachedPhoto) || isTyping}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
