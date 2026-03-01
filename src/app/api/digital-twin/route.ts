import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const MAX_INPUT_CHARS = Number(process.env.DIGITAL_TWIN_MAX_INPUT_CHARS ?? "10000");
const MAX_BODY_BYTES = Number(process.env.DIGITAL_TWIN_MAX_BODY_BYTES ?? "50000");
const MAX_MESSAGES = Number(process.env.DIGITAL_TWIN_MAX_MESSAGES ?? "20");
const MAX_MESSAGE_CHARS = Number(process.env.DIGITAL_TWIN_MAX_MESSAGE_CHARS ?? "2000");
const MODEL_NAME = process.env.DIGITAL_TWIN_MODEL ?? "openai/gpt-oss-120b";
const MAX_TOKENS = Number(process.env.DIGITAL_TWIN_MAX_TOKENS ?? "400");
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const OPENROUTER_TITLE = process.env.OPENROUTER_APP_TITLE ?? "Kartik Digital Twin";

function formatExperienceSince(start: Date, end: Date): string {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} month${remMonths === 1 ? "" : "s"}`;
  if (remMonths === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"} ${remMonths} month${remMonths === 1 ? "" : "s"}`;
}

function buildTwinSystemPrompt(asOfDate: Date): string {
  const asOfIso = asOfDate.toISOString().slice(0, 10);
  const senseTenure = formatExperienceSince(new Date("2023-01-01"), asOfDate);

  return `You are Kartik Sharma's Digital Twin on his personal website.
Answer questions about my career, skills, and work style in first person ("I", "my").

Response behavior:
- Be factual, concise, and professional.
- Use plain text only (no Markdown, no **bold**, no headings, no code fences).
- Do not invent achievements, technologies, dates, or responsibilities.
- If a detail is not in the known profile data, say: "I do not have that detail in my published profile yet."
- For career questions, prefer concrete metrics and outcomes where available.

Known profile data (from LinkedIn resume):
- Name: Kartik Sharma
- Location: Bengaluru, Karnataka, India
- Current company: Sense
- As-of date for this session: ${asOfIso}
- Total tenure at Sense (internship + full-time), computed as of this date: ${senseTenure}

Role timeline:
1) Senior Software Engineer, Sense (April 2025 - Present)
2) Software Engineer, Sense (July 2023 - April 2025)
3) Software Engineer Intern, Sense (January 2023 - June 2023)

Professional summary context:
- I enjoy building backend systems that work reliably in the real world.
- My day-to-day stack includes Java, Spring Boot, AWS, Kafka, and related backend tooling.
- I grew from intern to senior engineer by solving tough production problems and improving reliability at scale.
- I actively learn new technologies; latest focus areas include MCP(Model Context Protocol) and LLM applications in products.

Senior Software Engineer highlights:
- Led SOC2 compliance transition by managing a major Spring Boot 3.x upgrade across 20+ services.
- Identified and optimized a high-throughput webhook processing system, reducing infrastructure footprint by 85% and saving thousands of dollars annually in compute costs.
- Owned end-to-end development of the mission-critical Batching Engine for enterprise high-volume communications and sender reputation protection.
- Built advanced JVM monitoring beyond CPU/RAM with 30+ metrics (heap, GC, threads, OS resources), improving root-cause analysis and catching issues like file descriptor leaks.
- Frequently acted as a lead responder during production incidents.

Software Engineer highlights:
- Designed a backpressure-isolated Kafka processing architecture with async offloading to SQS, removing consumer-group rebalancing as a failure mode and eliminating recurring monthly outages.
- Built a Cross-Platform Email Migration tool for links/images/dynamic variables across legacy and next-gen engines, increasing adoption and reducing manual effort by ~95%.
- Established observability for flagship automation product with 5+ custom dashboards and 15+ visualizations.
- Led version-controlled DB migration adoption by introducing Flyway in Java microservices; authored rollout strategy and knowledge-sharing sessions.
- Collaborated with DevOps on high-stakes tasks such as Kafka cluster upgrades.
- Helped onboard new hires and junior engineers via deep dives and on-call readiness training.

Internship highlights:
- Owned Domain Configuration feature from scratch for custom subdomains on Sense Landing Pages; built on AWS using S3, CloudFront, and Certificate Manager.
- Designed and implemented gRPC APIs for faster microservice communication.
- Maintained 90% unit test coverage using JUnit and Mockito across Java and Spring Boot services.

Skills listed:
- Programming/Backend: Java, C++, Spring Boot, gRPC, Apache Camel
- Data/Messaging: MySQL, Kafka, SQS, Redis
- Cloud/Infra: AWS, S3, CloudFront
- Quality/Observability: JUnit, Mockito, Grafana, JMX, MCP

Learning focus:
- LLMs and MCP for integrating AI capabilities into backend products in a structured, production-safe way.

Education:
- PES University: Bachelor of Technology (BTech), Computer Science (2019 - 2023) 7.81 CGPA
- Whitefield Global School: Class 12 (2018 - 2019) 92.4%
- Whitefield Global School: Class 10 (2016 - 2017) 10.0 CGPA

Certifications:
- Programming for Everybody (Getting Started with Python)
- Complete Web Development From Absolute Basics

When asked "why hire you" or "what makes you strong":
- Emphasize reliability engineering, production ownership, measurable impact, and backend system design under scale.
`;
}

function capConversationForInput(messages: ChatMessage[], systemPromptChars: number): ChatMessage[] {
  const budget = Math.max(0, MAX_INPUT_CHARS - systemPromptChars);
  let used = 0;
  const selected: ChatMessage[] = [];

  // Keep most recent context first.
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    const normalized = msg.content.replace(/\s+/g, " ").trim();
    if (!normalized) continue;

    const remaining = budget - used;
    if (remaining <= 0) break;

    // Clip each message to the remaining character budget.
    const clipped = normalized.slice(0, remaining);
    selected.push({ role: msg.role, content: clipped });
    used += clipped.length;

    if (used >= budget) break;
  }

  return selected.reverse();
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ChatMessage>;
  if (!(candidate.role === "user" || candidate.role === "assistant" || candidate.role === "system")) return false;
  if (typeof candidate.content !== "string") return false;
  if (candidate.content.length > MAX_MESSAGE_CHARS) return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request payload is too large." }, { status: 413 });
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request payload is too large." }, { status: 413 });
    }

    let body: { messages?: unknown };
    try {
      body = rawBody ? (JSON.parse(rawBody) as { messages?: unknown }) : {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (body.messages !== undefined && !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request format: messages must be an array." }, { status: 400 });
    }

    const incoming = (body.messages ?? []) as unknown[];
    if (incoming.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Too many messages. Max allowed is ${MAX_MESSAGES}.` }, { status: 400 });
    }
    if (!incoming.every(isValidMessage)) {
      return NextResponse.json(
        {
          error: `Invalid message payload. Each message must include role (user/assistant/system) and content <= ${MAX_MESSAGE_CHARS} chars.`
        },
        { status: 400 }
      );
    }
    const validMessages = incoming.filter(isValidMessage);
    const userAndAssistantMessages = validMessages.filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
    );
    const twinSystemPrompt = buildTwinSystemPrompt(new Date());
    const boundedMessages = capConversationForInput(userAndAssistantMessages, twinSystemPrompt.length);

    if (boundedMessages.length === 0) {
      return NextResponse.json({ error: "Please send at least one message." }, { status: 400 });
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": OPENROUTER_REFERER,
        "X-Title": OPENROUTER_TITLE
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "system", content: twinSystemPrompt }, ...boundedMessages],
        temperature: 0.3,
        max_tokens: MAX_TOKENS,
        stream: true
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return NextResponse.json(
        { error: `OpenRouter request failed (${openRouterResponse.status}): ${errorText}` },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        if (!openRouterResponse.body) {
          controller.error(new Error("No streaming body returned by OpenRouter."));
          return;
        }

        const reader = openRouterResponse.body.getReader();
        let buffer = "";

        try {
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

              try {
                const parsed = JSON.parse(payload) as {
                  choices?: Array<{
                    delta?: { content?: string };
                    message?: { content?: string };
                  }>;
                };

                const delta = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                // Ignore malformed chunks and continue streaming.
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error while contacting OpenRouter." }, { status: 500 });
  }
}
