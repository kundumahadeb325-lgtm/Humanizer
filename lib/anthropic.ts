import "server-only";
import Anthropic, { APIError } from "@anthropic-ai/sdk";

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "No Anthropic API key is configured. Add your own key in Settings, or set ANTHROPIC_API_KEY on the server.",
    );
    this.name = "MissingApiKeyError";
  }
}

/**
 * Resolves an Anthropic client for a single request. A key pasted into the
 * Settings panel (sent per-request, kept only in the visitor's browser)
 * takes priority over a server-configured default, so a visitor's own key
 * and quota are used whenever they've provided one.
 */
export function resolveClient(clientSuppliedKey?: string | null): Anthropic {
  const key = clientSuppliedKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new MissingApiKeyError();
  }
  return new Anthropic({ apiKey: key });
}

/**
 * `APIError.message` is the SDK's own `"<status> <json-stringified body>"`
 * string — useful for logs, unreadable in a UI. The actual human-readable
 * text lives nested at `error.error.message` in Anthropic's error envelope
 * (`{"type":"error","error":{"type":"...","message":"..."}}`). Pull that out
 * when present; fall back to the raw message only if the shape is unexpected.
 */
function extractApiErrorDetail(err: APIError): string | null {
  const body = err.error;
  if (body && typeof body === "object" && "error" in body) {
    const inner = (body as { error?: unknown }).error;
    if (inner && typeof inner === "object" && "message" in inner) {
      const msg = (inner as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }
  return null;
}

/** A short, user-facing message for an Anthropic API error. */
export function describeApiError(err: APIError): string {
  if (err.status === 401) return "That API key was rejected. Double-check it in Settings.";
  if (err.status === 429) return "Rate limited by Anthropic. Wait a moment and try again.";
  if (err.status && err.status >= 500) {
    return "Anthropic's API is temporarily unavailable. Please retry shortly.";
  }
  return extractApiErrorDetail(err) ?? err.message ?? "The request failed. Please try again.";
}
