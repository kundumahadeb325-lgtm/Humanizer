import "server-only";
import Anthropic from "@anthropic-ai/sdk";

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
