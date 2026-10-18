interface StreamHandlers {
  onDelta: (text: string) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

interface StreamEvent {
  type: "delta" | "error" | "done";
  text?: string;
  message?: string;
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
      return (data as { error: string }).error;
    }
  } catch {
    // fall through to default message
  }
  return "The rewrite failed. Please try again.";
}

function handleLine(line: string, handlers: StreamHandlers) {
  const trimmed = line.trim();
  if (!trimmed) return;
  let evt: StreamEvent;
  try {
    evt = JSON.parse(trimmed) as StreamEvent;
  } catch {
    return;
  }
  if (evt.type === "delta" && typeof evt.text === "string") {
    handlers.onDelta(evt.text);
  } else if (evt.type === "error") {
    handlers.onError(evt.message ?? "Something went wrong.");
  } else if (evt.type === "done") {
    handlers.onDone();
  }
}

/**
 * Consumes the newline-delimited JSON stream from /api/humanize. Errors
 * (both pre-stream HTTP errors and mid-stream failure events) are reported
 * via onError rather than a thrown exception, so callers can always resolve
 * their loading state the same way.
 */
export async function streamHumanize(
  text: string,
  apiKey: string | undefined,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, apiKey }),
      signal,
    });
  } catch {
    handlers.onError("Couldn't reach the server. Check your connection and try again.");
    return;
  }

  if (!res.ok || !res.body) {
    handlers.onError(await readErrorBody(res));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) handleLine(line, handlers);
  }
  if (buffer) handleLine(buffer, handlers);
}
