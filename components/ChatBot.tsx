"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! 🙏 Welcome to Khalsa Motors! I'm here to help you find your perfect car. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please WhatsApp us directly at +91 98180 36523!",
        },
      ]);
    }
    setLoading(false);
  };

  const quickQuestions = [
    "What cars do you have?",
    "How do I buy a car?",
    "Do you help with loans?",
    "What documents do I need?",
  ];

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? "bg-brand-navy rotate-0" : "bg-brand-gold hover:scale-110"
        }`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-brand-navy" />
        )}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {messages.filter((m) => m.role === "assistant").length}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[380px] bg-white rounded-sm shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-brand-navy px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="bg-brand-gold p-1.5 rounded-full">
              <Bot size={16} className="text-brand-navy" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">
                Khalsa Motors Assistant
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-400 text-xs">Online now</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot size={14} className="text-brand-navy" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-sm text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-gold text-brand-navy font-medium"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center shrink-0 mr-2">
                  <Bot size={14} className="text-brand-navy" />
                </div>
                <div className="bg-white px-4 py-3 rounded-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-brand-gold rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-brand-gold rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-brand-gold rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions — show only at start */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5 shrink-0">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={async () => {
                    setMessages((prev) => [
                      ...prev,
                      { role: "user", content: q },
                    ]);
                    setLoading(true);
                    try {
                      const response = await fetch("/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          messages: [...messages, { role: "user", content: q }],
                        }),
                      });
                      const data = await response.json();
                      setMessages((prev) => [
                        ...prev,
                        { role: "assistant", content: data.reply },
                      ]);
                    } catch {
                      setMessages((prev) => [
                        ...prev,
                        {
                          role: "assistant",
                          content:
                            "Sorry! Please WhatsApp us at +91 98180 36523",
                        },
                      ]);
                    }
                    setLoading(false);
                  }}
                  className="text-xs bg-white border border-brand-gold/40 text-brand-navy px-2.5 py-1 rounded-full hover:bg-brand-gold/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-gold transition-colors"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-navy p-2 rounded-sm transition-colors disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
