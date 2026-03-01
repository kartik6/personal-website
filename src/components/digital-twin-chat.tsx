"use client";

import { FormEvent, useMemo, useState } from "react";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "What are your strongest backend engineering achievements?",
  "How did you improve reliability at Sense?",
  "What are you learning now and why?"
];

export function DigitalTwinChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I am Kartik's Digital Twin. Ask me about my backend experience, architecture decisions, or career journey."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSend = useMemo(() => !loading && input.trim().length > 0, [input, loading]);

  const cleanModelText = (text: string) =>
    text
      .replace(/\*\*/g, "")
      .replace(/\u202f/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\s+\n/g, "\n");

  const sendMessage = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: UiMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const assistantId = `a-${Date.now()}`;
    const placeholder: UiMessage = { id: assistantId, role: "assistant", content: "" };
    const nextMessages: UiMessage[] = [...messages, userMessage, placeholder];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/digital-twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "The Digital Twin did not return a reply.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullReply += decoder.decode(value, { stream: true });
        const cleaned = cleanModelText(fullReply);

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: cleaned || "..." } : msg))
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: cleanModelText(fullReply).trim() || "I could not generate a response. Please try again."
              }
            : msg
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id.startsWith("a-") && m.content === ""
            ? { ...m, content: "I ran into an issue while answering. Please try again." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="twin-floating">
      {open ? (
        <article className="digital-twin-card">
          <div className="digital-twin-head">
            <p className="badge">Digital Twin</p>
            <button type="button" className="twin-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chat-window">
            {messages.map((msg) => (
              <div className={`chat-row ${msg.role}`} key={msg.id}>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading ? (
              <div className="chat-row assistant">
                <p>Thinking...</p>
              </div>
            ) : null}
          </div>

          <div className="quick-prompts">
            {starterPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about career, systems, achievements..."
              disabled={loading}
            />
            <button type="submit" disabled={!canSend}>
              Send
            </button>
          </form>
          {error ? <p className="chat-error">{error}</p> : null}
        </article>
      ) : null}

      <button className="twin-fab" onClick={() => setOpen((v) => !v)} type="button" aria-label="Toggle AI chat">
        {open ? "Hide Twin" : "Ask AI Twin"}
      </button>
    </div>
  );
}
