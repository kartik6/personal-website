# Building This Portfolio Website: Beginner-Friendly Tutorial

## 1) What You Built (At a Glance)

You now have a modern **Next.js** personal website with:

- A polished frontend portfolio page
- A dark/light theme toggle
- A terminal-style hero section
- Career timeline and tech stack sections
- A floating AI chat widget (“Digital Twin”)
- A backend API route that calls **OpenRouter** with model `openai/gpt-oss-120b`
- Streaming AI responses from server to UI
- Basic prompt safety and context limits

Even though you asked for frontend help, this project includes both **frontend** and **backend** pieces because AI chat requires a secure server layer for your API key.

---

## 2) Technology Summary

### Frontend

- **Next.js App Router** (`src/app`) for page rendering and routing
- **React** components for UI behavior
- **CSS** in `src/app/globals.css` for styling and layout
- **Client components** (`"use client"`) for interactive features (theme toggle, chat)

### Backend (inside Next.js)

- **Route Handler API**: `src/app/api/digital-twin/route.ts`
- Calls OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Uses `OPENROUTER_API_KEY` from `.env`
- Streams model output back to browser in real time

### AI Integration

- Model: `openai/gpt-oss-120b`
- System prompt acting as your “Digital Twin”
- Conversation trimming via character budget to keep request context bounded
- Plain-text output guidance to avoid markdown artifacts in UI

---

## 3) Project Structure (Relevant Files)

```txt
src/
  app/
    api/digital-twin/route.ts     # Backend API for AI chat
    globals.css                   # Global styles (site + floating chatbot)
    layout.tsx                    # App shell and initial theme setup
    page.tsx                      # Main portfolio page content
  components/
    digital-twin-chat.tsx         # Floating chatbot UI + streaming client logic
    theme-toggle.tsx              # Dark/light mode toggle
    console-easter-egg.tsx        # Devtools easter egg
```

---

## 4) High-Level Walkthrough

### Step A: Build the portfolio UI

In `src/app/page.tsx`, sections were added for:

- Hero/intro
- About
- Currently Learning
- Tech Stack
- Career Log
- Open Source Log
- Contact CTA

The hero uses terminal-like styling, and the timeline uses git-log inspired cards.

### Step B: Add interactivity

Two key interactive components:

1. `theme-toggle.tsx` toggles light/dark by setting `data-theme` on `<html>`
2. `digital-twin-chat.tsx` manages message state, sends requests, and streams replies

### Step C: Add secure AI backend route

`src/app/api/digital-twin/route.ts`:

- Reads `OPENROUTER_API_KEY` from environment
- Accepts chat messages from frontend
- Applies context limit (input char budget)
- Calls OpenRouter with your chosen model
- Streams chunks back to browser

### Step D: Style + UX polish

`globals.css` handles:

- Theme variables
- Site style language
- Floating chat widget layout
- Overlap prevention (wrapping, sizing, z-index, panel backgrounds)

---

## 5) Detailed Code Review With Examples

## 5.1 API Route: `src/app/api/digital-twin/route.ts`

### Why this file exists

You never expose API keys in frontend code. The browser talks to your own API route, and that route talks to OpenRouter.

### Core concepts in this file

- Input validation
- Prompt engineering (Digital Twin behavior)
- Input context budget control
- Streaming passthrough from model to UI

### Key snippet: input budget limiter

```ts
const MAX_INPUT_CHARS = 10_000;

function capConversationForInput(messages: ChatMessage[], systemPromptChars: number): ChatMessage[] {
  const budget = Math.max(0, MAX_INPUT_CHARS - systemPromptChars);
  let used = 0;
  const selected: ChatMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    const normalized = msg.content.replace(/\s+/g, " ").trim();
    if (!normalized) continue;

    const remaining = budget - used;
    if (remaining <= 0) break;

    const clipped = normalized.slice(0, remaining);
    selected.push({ role: msg.role, content: clipped });
    used += clipped.length;
  }

  return selected.reverse();
}
```

What this does:

- Keeps the **most recent messages** first
- Stops when combined message chars exceed budget
- Prevents very large input payloads

### Key snippet: OpenRouter request

```ts
const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    "X-Title": "Kartik Digital Twin"
  },
  body: JSON.stringify({
    model: "openai/gpt-oss-120b",
    messages: [{ role: "system", content: twinSystemPrompt }, ...boundedMessages],
    temperature: 0.3,
    max_tokens: 400,
    stream: true
  })
});
```

What to notice:

- `max_tokens: 400` controls output size at the model level
- `stream: true` lets UI update progressively

### Key snippet: stream chunks to client

```ts
const stream = new ReadableStream<Uint8Array>({
  async start(controller) {
    const reader = openRouterResponse.body!.getReader();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          controller.close();
          return;
        }

        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(delta));
      }
    }
  }
});
```

Why it matters:

- Instead of waiting for one big answer, tokens appear live in the UI
- Better perceived speed and UX

---

## 5.2 Chat Widget: `src/components/digital-twin-chat.tsx`

### Why this file exists

This is your floating chatbot experience: open/close state, message rendering, streaming client logic.

### Key snippet: floating widget state

```tsx
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<UiMessage[]>([
  { id: "welcome", role: "assistant", content: "Hi, I am Kartik's Digital Twin..." }
]);
```

### Key snippet: sending and streaming response

```tsx
const res = await fetch("/api/digital-twin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: nextMessages.map(m => ({ role: m.role, content: m.content })) })
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let fullReply = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  fullReply += decoder.decode(value, { stream: true });
  const cleaned = cleanModelText(fullReply);

  setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: cleaned || "..." } : msg));
}
```

### Markdown artifact cleanup

You added a cleanup helper so `**` does not appear in UI:

```ts
const cleanModelText = (text: string) =>
  text
    .replace(/\*\*/g, "")
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+\n/g, "\n");
```

---

## 5.3 Main Page Composition: `src/app/page.tsx`

### Why this file exists

It composes your entire portfolio experience and mounts the floating chat globally.

### Key snippet: mount floating twin once for whole page

```tsx
<main className="site-shell">
  <ConsoleEasterEgg />
  <DigitalTwinChat />
  <div className="noise-layer" />
  ...
</main>
```

This ensures chat is available anywhere on your homepage.

---

## 5.4 Styling and Layout: `src/app/globals.css`

### Why this file exists

All visual consistency is controlled here.

### Important widget stability fixes included

- Strong panel background (`--twin-panel`) to avoid bleed-through
- High z-index for overlay priority
- Header stacking and wrapping to avoid collisions
- `overflow-wrap` and `word-break` for long model outputs and links
- Mobile width constraints for floating container

### Key snippet: floating placement

```css
.twin-floating {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 120;
  width: min(460px, calc(100vw - 2rem));
}
```

### Key snippet: safe text wrapping in chat bubbles

```css
.chat-row p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
```

---

## 6) Data Flow (End-to-End)

1. User opens floating chatbot and types question.
2. Frontend sends conversation to `/api/digital-twin`.
3. API route trims input context to 10k-char budget.
4. API sends request to OpenRouter with system prompt + recent messages.
5. OpenRouter streams response chunks.
6. API forwards chunks to browser stream.
7. Frontend updates assistant message progressively as tokens arrive.
8. User sees live response in chat window.

---

## 7) Why This Architecture Is Good for Beginners

- Keeps secrets safe (key never in browser bundle)
- Clear separation of concerns:
  - UI in components
  - AI networking in API route
  - styling in CSS
- Easy to iterate:
  - tune prompt without touching UI
  - tune UI without touching API

---

## 8) Self-Review: 5 Improvements You Could Make Next

1. Add server-side rate limiting
- Prevent abuse by limiting requests per IP/session (e.g., Upstash Redis or middleware).

2. Add structured conversation memory
- Persist recent messages in `localStorage` (or DB for authenticated users) so refresh doesn’t reset chat.

3. Add stronger prompt/context governance
- Move profile facts to a typed JSON object and build prompt from that object to reduce drift and duplication.

4. Improve streaming parser robustness
- Handle edge cases for partial JSON chunks more defensively and add telemetry for parser failures.

5. Add quality guardrails + tests
- Add unit tests for `capConversationForInput`
- Add integration tests for `/api/digital-twin`
- Add output post-processing tests for markdown artifact cleanup

---

## 9) Final Beginner Notes

- You now have a full-stack frontend project pattern: UI + server route + AI provider.
- The most important idea: never call paid AI APIs directly from the browser with secret keys.
- Your current setup is a strong practical base for adding advanced features like auth, chat history, or role-specific digital twin modes.
