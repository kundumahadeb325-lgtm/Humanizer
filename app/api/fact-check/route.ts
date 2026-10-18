import Anthropic, { APIError, AuthenticationError, RateLimitError } from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { MissingApiKeyError, describeApiError, resolveClient } from "@/lib/anthropic";
import {
  DEFAULT_MODEL,
  FACT_CHECK_JSON_SCHEMA,
  FACT_CHECK_SYSTEM_PROMPT,
  buildFactCheckUserPrompt,
} from "@/lib/prompts";
import type { ClaimVerdict, FactCheckClaim, FactCheckResult } from "@/lib/types";
import { MAX_INPUT_CHARS } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 90;

interface Body {
  text?: unknown;
  apiKey?: unknown;
}

const VALID_VERDICTS: ClaimVerdict[] = ["supported", "disputed", "unverifiable", "needs_context"];

async function runFactCheck(
  client: Anthropic,
  text: string,
  withSearch: boolean,
): Promise<Anthropic.Message> {
  return client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: FACT_CHECK_JSON_SCHEMA },
    },
    ...(withSearch
      ? { tools: [{ type: "web_search_20260209" as const, name: "web_search" as const, max_uses: 5 }] }
      : {}),
    system: FACT_CHECK_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildFactCheckUserPrompt(text) }],
  });
}

function parseResult(response: Anthropic.Message): { summary: string; claims: FactCheckClaim[] } {
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) {
    throw new Error("No structured result was returned.");
  }
  const raw = JSON.parse(textBlock.text) as { summary?: unknown; claims?: unknown };
  const summary = typeof raw.summary === "string" ? raw.summary : "";
  const claimsRaw = Array.isArray(raw.claims) ? raw.claims : [];
  const claims: FactCheckClaim[] = claimsRaw
    .filter(
      (c): c is Record<string, unknown> =>
        typeof c === "object" && c !== null && typeof (c as Record<string, unknown>).claim === "string",
    )
    .map((c) => ({
      claim: String(c.claim),
      verdict: VALID_VERDICTS.includes(c.verdict as ClaimVerdict)
        ? (c.verdict as ClaimVerdict)
        : "unverifiable",
      confidence: c.confidence === "low" || c.confidence === "high" ? c.confidence : "medium",
      explanation: typeof c.explanation === "string" ? c.explanation : "",
      sources: Array.isArray(c.sources) ? c.sources.filter((s): s is string => typeof s === "string") : [],
    }));
  return { summary, claims };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  const apiKey = typeof body.apiKey === "string" ? body.apiKey : undefined;

  if (!text.trim()) {
    return Response.json({ error: "Paste some text to fact-check first." }, { status: 400 });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return Response.json(
      {
        error: `That's ${text.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()} — split longer pieces into sections.`,
      },
      { status: 400 },
    );
  }

  let client: Anthropic;
  try {
    client = resolveClient(apiKey);
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  let response: Anthropic.Message;
  let usedWebSearch = true;
  try {
    response = await runFactCheck(client, text, true);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return Response.json({ error: describeApiError(err) }, { status: 400 });
    }
    if (err instanceof RateLimitError) {
      return Response.json({ error: describeApiError(err) }, { status: 429 });
    }
    // Web search may be unavailable for this key/organization — retry once
    // on the model's own knowledge only, so the feature still works.
    usedWebSearch = false;
    try {
      response = await runFactCheck(client, text, false);
    } catch (err2) {
      const message =
        err2 instanceof APIError
          ? describeApiError(err2)
          : "Fact-check failed unexpectedly. Please try again.";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  if (response.stop_reason === "refusal") {
    return Response.json(
      { error: "The model declined to fact-check this text." },
      { status: 422 },
    );
  }

  try {
    const { summary, claims } = parseResult(response);
    const result: FactCheckResult = { claims, summary, usedWebSearch };
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "Couldn't parse the fact-check result. Please try again." },
      { status: 502 },
    );
  }
}
