import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { MissingApiKeyError, describeApiError, resolveClient } from "@/lib/anthropic";
import { DEFAULT_MODEL, HUMANIZE_SYSTEM_PROMPT, buildHumanizeUserPrompt } from "@/lib/prompts";
import { MAX_INPUT_CHARS } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  text?: unknown;
  apiKey?: unknown;
}

function ndjson(obj: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(obj)}\n`);
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
    return Response.json({ error: "Paste some text to humanize first." }, { status: 400 });
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

  const approxInputTokens = Math.ceil(text.length / 4);
  const maxTokens = Math.min(32000, Math.max(4096, approxInputTokens * 2 + 2000));

  // Streamed as newline-delimited JSON so the browser can render the rewrite
  // as it arrives; a mid-stream failure (refusal, rate limit, upstream
  // error) surfaces as a {"type":"error"} line rather than a raw HTTP status,
  // since the response has already committed to a 200 stream by that point.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sawAnyText = false;
      try {
        const anthropicStream = client.messages.stream({
          model: DEFAULT_MODEL,
          max_tokens: maxTokens,
          thinking: { type: "adaptive" },
          output_config: { effort: "high" },
          system: HUMANIZE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildHumanizeUserPrompt(text) }],
        });

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sawAnyText = true;
            controller.enqueue(ndjson({ type: "delta", text: event.delta.text }));
          }
        }

        const final = await anthropicStream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            ndjson({
              type: "error",
              message:
                "The model declined to rewrite this text. Try rephrasing the source, or check that it doesn't touch a restricted topic.",
            }),
          );
        } else if (!sawAnyText) {
          controller.enqueue(
            ndjson({ type: "error", message: "No rewrite was returned. Please try again." }),
          );
        } else {
          controller.enqueue(ndjson({ type: "done" }));
        }
      } catch (err) {
        const message =
          err instanceof APIError
            ? describeApiError(err)
            : "The rewrite failed unexpectedly. Please try again.";
        controller.enqueue(ndjson({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
