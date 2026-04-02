"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatMessage from "@/components/ChatMessage";

function TypingIndicator() {
  return (
    <div className="glass inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        Kar AI
      </div>
      <div className="flex items-center gap-1">
        <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" />
        <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" />
        <span className="typing-dot inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" />
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Summary:\nTell me your annual income, age, city, HRA details (if any), and investments.\nEstimated Tax:\n—\nTax Saving Opportunities:\n80C, 80D, HRA, NPS (80CCD(1B))\nMissing Information:\nIncome type (salary/business), deductions, regime preference\nAction Steps:\nShare the details above and I’ll estimate your tax + savings.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAnchorRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = useMemo(
    () => !isSending && input.trim().length > 0,
    [isSending, input]
  );

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || isSending) return;

    setInput("");
    setIsSending(true);

    const userMsg = { id: crypto.randomUUID(), role: "user", content: message };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/tax-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errText =
          typeof data?.error === "string" ? data.error : "Request failed.";
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Summary:\n${errText}\nEstimated Tax:\n—\nTax Saving Opportunities:\n—\nMissing Information:\n—\nAction Steps:\nTry again in a moment.`,
          },
        ]);
        return;
      }

      const text = typeof data?.text === "string" ? data.text : "";
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text || "Summary:\nNo response.\nEstimated Tax:\n—\nTax Saving Opportunities:\n—\nMissing Information:\n—\nAction Steps:\nPlease try again.",
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Summary:\nNetwork error while contacting the AI.\nEstimated Tax:\n—\nTax Saving Opportunities:\n—\nMissing Information:\n—\nAction Steps:\nCheck your connection and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="noise" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-400/15 border border-emerald-300/20 grid place-items-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              <span className="text-emerald-300 font-semibold">K</span>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-zinc-50">
                Kar AI
              </div>
              <div className="text-xs text-zinc-400">
                Indian tax assistant • Gemini
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-zinc-400">
            Enter to send • Shift+Enter for newline
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <div className="py-6 pb-28">
          <div className="grid gap-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} role={m.role} content={m.content} />
            ))}

            {isSending && (
              <div className="w-full flex justify-start">
                <TypingIndicator />
              </div>
            )}

            <div ref={scrollAnchorRef} />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/35 backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <div className="glass rounded-2xl border border-white/10 p-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask about taxes, deductions, HRA, 80C/80D, new vs old regime..."
              className="min-h-[44px] max-h-36 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              className={[
                "h-11 shrink-0 rounded-2xl px-4 text-sm font-medium transition-all",
                canSend
                  ? "bg-emerald-400/15 text-emerald-200 border border-emerald-300/20 hover:bg-emerald-400/20 active:scale-[0.98]"
                  : "bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed",
              ].join(" ")}
            >
              {isSending ? "Sending…" : "Send"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            We don’t store your chat. Don’t share PAN/Aadhaar.
          </div>
        </div>
      </div>
    </div>
  );
}
