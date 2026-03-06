"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, SendHorizontal, Loader, ChevronDown, ChevronUp, Lightbulb, Wrench } from "lucide-react";

interface DiagnosisResult {
    diagnosis: string;
    causes: string[];
    suggestedServiceKey: string;
    suggestedServiceLabel: string;
    message: string;
}

interface AIAssistantProps {
    onServiceSelect?: (serviceKey: string) => void;
}

export default function AIAssistant({ onServiceSelect }: AIAssistantProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [error, setError] = useState("");

    async function handleDiagnose() {
        if (!input.trim() || loading) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/ai/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "AI diagnosis failed");
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleApplySuggestion() {
        if (result?.suggestedServiceKey && onServiceSelect) {
            onServiceSelect(result.suggestedServiceKey);
            setOpen(false);
        }
    }

    return (
        <div className="mb-5 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden shadow-sm">
            {/* Header — always visible */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-purple-100/50 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-purple-900 text-sm">AI Breakdown Assistant</p>
                        <p className="text-purple-600 text-xs">Describe your problem — AI will suggest the right service</p>
                    </div>
                </div>
                {open ? <ChevronUp size={18} className="text-purple-600" /> : <ChevronDown size={18} className="text-purple-600" />}
            </button>

            {/* Collapsible body */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4">
                            {/* Input area */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleDiagnose()}
                                    placeholder="e.g. My bike tyre is flat and I cannot move"
                                    className="flex-1 px-4 py-3 rounded-xl border border-purple-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleDiagnose}
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading
                                        ? <Loader size={18} className="animate-spin" />
                                        : <SendHorizontal size={18} />
                                    }
                                </button>
                            </div>

                            {error && (
                                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                            )}

                            {/* Diagnosis Result */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
                                        {/* Causes */}
                                        <div className="bg-white rounded-xl border border-purple-100 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb size={16} className="text-yellow-500" />
                                                <p className="font-semibold text-gray-800 text-sm">Possible Causes</p>
                                            </div>
                                            <ul className="space-y-1">
                                                {result.causes.map((c, i) => (
                                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                        <span className="text-purple-400 font-bold mt-0.5">•</span>
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Suggested service */}
                                        <div className="bg-purple-600 text-white rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Wrench size={16} />
                                                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Recommended Service</p>
                                            </div>
                                            <p className="text-lg font-bold">{result.suggestedServiceLabel}</p>
                                            <p className="text-purple-200 text-sm mt-1">{result.message}</p>
                                        </div>

                                        {/* Apply suggestion button */}
                                        {onServiceSelect && (
                                            <button
                                                type="button"
                                                onClick={handleApplySuggestion}
                                                className="w-full py-3 bg-white border-2 border-purple-600 text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all text-sm"
                                            >
                                                ✅ Apply — Select {result.suggestedServiceLabel}
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
