import type { NextRequest } from "next/server";
import { analyzeText } from "@/lib/heuristics";
import { MAX_INPUT_CHARS } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  text?: unknown;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  if (text.length > MAX_INPUT_CHARS) {
    return Response.json({ error: "Text exceeds the length limit." }, { status: 400 });
  }

  return Response.json(analyzeText(text));
}
