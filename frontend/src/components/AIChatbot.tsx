"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  RefreshCw,
  Volume2,
  ChevronRight,
  MessageSquare,
  Copy,
  Check,
  PlusCircle,
  Clock,
  Compass,
  FileCheck,
  Activity,
  Bus,
  CornerDownLeft,
  Shield,
  Landmark,
  Building,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { ChatMessage } from "@/types/city";

interface AIChatbotProps {
  currentCityName?: string;
  currentCityId?: string;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onLocationSelect?: (location: { lat: number; lng: number; title: string }) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function AIChatbot({
  currentCityName = "Pune",
  currentCityId = "pune",
  initialQuery = "",
  onClearInitialQuery,
  onLocationSelect
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([
    "Emergency hospital trauma centers",
    "Historic forts & tourist attractions",
    "Citizen service documents & birth certificate",
    "Metro lines & rapid transit schedule"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Suggested questions grouped by intent
  const starterPrompts = [
    {
      category: "🏥 Emergency & Healthcare",
      icon: Activity,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50/70 hover:bg-rose-50 border-rose-200/80",
      questions: [
        `Where is the nearest 24/7 ICU hospital in ${currentCityName}?`,
        `Emergency ambulance dispatch and medical helplines in ${currentCityName}`,
      ]
    },
    {
      category: "🏛️ Tourism & Culture",
      icon: Compass,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200/80",
      questions: [
        `Top historic forts and heritage places to visit in ${currentCityName}`,
        `Best 1-day sightseeing itinerary for family in ${currentCityName}`,
      ]
    },
    {
      category: "🚇 Transit & Travel",
      icon: Bus,
      color: "from-sky-500 to-blue-600",
      textColor: "text-sky-600",
      bgColor: "bg-sky-50/70 hover:bg-sky-50 border-sky-200/80",
      questions: [
        `Metro line routes, station map, and timings in ${currentCityName}`,
        `Fastest way to reach the Airport from ${currentCityName} Railway Station`,
      ]
    },
    {
      category: "📜 Civic & Documents",
      icon: FileCheck,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50/70 hover:bg-amber-50 border-amber-200/80",
      questions: [
        `How do I apply for a birth certificate online in ${currentCityName}?`,
        `Steps and portal link to pay property tax in ${currentCityName}`,
      ]
    }
  ];

  // If initialQuery is passed from Hero search, set it into the input box so the user can see & send it
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputPrompt(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery, onClearInitialQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputPrompt).trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setLoading(true);

    // Save prompt snippet to chat history sidebar if not already present
    if (!chatHistory.includes(messageText)) {
      setChatHistory((prev) => [messageText.slice(0, 36), ...prev.slice(0, 9)]);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          cityId: currentCityId,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        content: data.answer || "I have processed your inquiry with our municipal database.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || "Smart City Assistant",
        locationAction: data.suggestedAction,
        recommendedActions: data.recommendedActions
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        content: "I encountered a network timeout while connecting to the smart city AI server. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakMessage = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInputPrompt("");
  };

  return (
    <div className="flex h-full w-full bg-[#f8fafc] border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden">
      {/* ---------------- 1. CHATGPT-STYLE SIDEBAR (Left) ---------------- */}
      <div className="hidden lg:flex w-64 bg-[#0f172a] text-slate-300 flex-col justify-between p-3.5 border-r border-slate-800">
        <div className="space-y-4">
          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl text-xs font-semibold flex items-center gap-2.5 transition border border-slate-700/60 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>New Chat Session</span>
          </button>

          {/* Quick Filter Prompts */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Recent Conversations</span>
            </div>
            {chatHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item)}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition truncate flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>

          {/* Core City Capabilities */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Explore {currentCityName}
            </div>
            <button
              onClick={() => handleSendMessage(`Show me all emergency hospitals in ${currentCityName}`)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 transition flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Trauma Hospitals</span>
            </button>
            <button
              onClick={() => handleSendMessage(`Top forts, heritage and tourist places in ${currentCityName}`)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 transition flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>Tourist Places</span>
            </button>
            <button
              onClick={() => handleSendMessage(`How to apply for official birth certificate in ${currentCityName}?`)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 transition flex items-center gap-2"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Municipal Services</span>
            </button>
            <button
              onClick={() => handleSendMessage(`Metro and bus transit routes in ${currentCityName}`)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-cyan-300 transition flex items-center gap-2"
            >
              <Bus className="w-3.5 h-3.5 text-amber-400" />
              <span>Transit Timetables</span>
            </button>
          </div>
        </div>

        {/* City Info Card */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentCityName} City Portal</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Connected to official municipal GIS directory.
          </p>
        </div>
      </div>

      {/* ---------------- 2. MAIN CHAT CONTAINER (Right / Center) ---------------- */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* ChatGPT Header */}
        <div className="h-14 px-6 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">SmartCityGPT</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                  {currentCityName} Edition
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              title="Reset Chat"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 bg-slate-50/50">
          {/* Zero State: Do not display any messages first, just suggest animated questions that the user can add/click */}
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center py-6 animate-message-in">
              {/* Animated Header Hero */}
              <div className="text-center space-y-3 mb-8">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 animate-bot-ring">
                    <Bot className="w-8 h-8" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                    ✓
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    SmartCity Assistant for {currentCityName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    What would you like to explore? Choose a suggested question below to get instant guidance:
                  </p>
                </div>
              </div>

              {/* Categorized Question Grid with Staggered Hover Effect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {starterPrompts.map((group, gIdx) => {
                  const Icon = group.icon;
                  return (
                    <div
                      key={gIdx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-400 transition-all duration-300 space-y-2.5 group"
                    >
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${group.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{group.category}</span>
                      </div>

                      <div className="space-y-1.5">
                        {group.questions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(q)}
                            className="w-full text-left p-2.5 rounded-xl text-xs text-slate-700 bg-slate-50/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-100 transition-all duration-200 flex items-center justify-between group/btn active:scale-[0.98]"
                          >
                            <span className="line-clamp-2 leading-relaxed">{q}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all flex-shrink-0 ml-1.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 sm:gap-4 max-w-3xl mx-auto animate-message-in ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-blue-500/20 animate-bot-ring"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`flex-1 rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-xs transition-all ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white max-w-[85%] rounded-tr-none ml-auto"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none space-y-3"
                  }`}
                >
                {/* Text Content with Clean Formatting (No Raw Stars) */}
                <div className="space-y-2 text-sm leading-relaxed selection:bg-blue-200">
                  {msg.content.split("\n").map((line, lIdx) => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                      return <div key={lIdx} className="h-2" />;
                    }

                    // Section Heading (e.g., ### Heading)
                    if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
                      const cleanHead = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/\*/g, "");
                      return (
                        <h4 key={lIdx} className="font-extrabold text-slate-900 text-sm mt-3 mb-1 text-blue-900">
                          {cleanHead}
                        </h4>
                      );
                    }

                    // Bullet items (e.g. • or - or *)
                    const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
                    const textAfterBullet = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;

                    // Parse bold (**text**) cleanly
                    const segments = textAfterBullet.split(/(\*\*[^*]+\*\*)/g);

                    return (
                      <div key={lIdx} className={isBullet ? "flex items-start gap-2 ml-1" : ""}>
                        {isBullet && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        )}
                        <p className="flex-1 text-slate-800">
                          {segments.map((seg, sIdx) => {
                            if (seg.startsWith("**") && seg.endsWith("**")) {
                              return (
                                <strong key={sIdx} className="font-bold text-slate-900">
                                  {seg.slice(2, -2)}
                                </strong>
                              );
                            }
                            // Also strip any rogue isolated single stars
                            return <span key={sIdx}>{seg.replace(/\*/g, "")}</span>;
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Assistant Footer Actions (Copy, TTS, Source badge, Map action) */}
                {msg.sender === "assistant" && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Smart City Assistant</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="hover:text-slate-700 flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-slate-100"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => speakMessage(msg.content)}
                        className="hover:text-blue-600 flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-slate-100"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Location Map Action Pill */}
                {msg.locationAction && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onLocationSelect && msg.locationAction) {
                          onLocationSelect(msg.locationAction);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-200 shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Locate on {currentCityName} City Map &rarr;</span>
                    </button>
                  </div>
                )}

                {/* ChatGPT-style Recommended Follow-up Prompt Chips */}
                {msg.recommendedActions && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.recommendedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 text-left font-medium"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))) }

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 max-w-3xl mx-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-500 font-medium ml-1.5">
                  Thinking & cross-referencing {currentCityName} database...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ChatGPT Style Floating Input Container */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-white rounded-2xl border border-slate-300/80 shadow-lg p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask anything about ${currentCityName} (e.g. ICU beds, metro route, birth certificate)...`}
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm px-3 py-2.5 focus:outline-none resize-none max-h-32"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || loading}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition shadow-sm active:scale-95 flex-shrink-0"
                title="Send query"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400">
              SmartCityGPT may provide localized guidance. Verify critical clearances with {currentCityName} Municipal Corporation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
