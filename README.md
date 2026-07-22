# Humanizer

Rewrites AI-assisted drafts into clean, formal, professional prose, no filler, no fluff, no metaphors, and flags the specific writing patterns most associated with unedited AI output. A separate pass fact-checks the result.

## What it does

- **Humanize** — rewrites pasted text into a plain, precise, senior-editor register. No metaphors or idioms, no hedging, no buzzword vocabulary, no em dashes, no promotional language. Preserves every fact and the original structure.
- **Pattern analysis** — a local, regex-based heuristic (`lib/heuristics.ts`) scores text on em dashes, curly quotes, AI-typical vocabulary, filler/hedging phrases, promotional language, vague attribution, negative parallelism, generic conclusions, emoji, and sentence-rhythm monotony. Runs entirely client-side; no API key needed. This is a heuristic for in-editor feedback, not a model of any third-party detector.
- **Fact-check** — extracts the checkable claims from a piece of text and marks each one supported, disputed, unverifiable, or needing context, using the model's own knowledge plus live web search when available.

See the in-app "What this is, and isn't" note: this tool is not a guaranteed bypass of any specific AI detector, and fact-check output is AI-assisted review, not a verified-true stamp.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS, calling the Claude API (`@anthropic-ai/sdk`) with `claude-opus-4-8` by default.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

Open `http://localhost:3000`.

### API key

The app works in two modes:

1. **Bring your own key (default).** Open Settings in the editor and paste an Anthropic API key. It's stored only in your browser's `localStorage` and sent solely with your own requests — never logged or persisted server-side.
2. **Server-configured key.** Set `ANTHROPIC_API_KEY` in `.env.local` to give every visitor a working default; a visitor's own key (if set) still takes priority.

Get a key at [console.anthropic.com](https://console.anthropic.com/settings/keys).

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run start        # run the production build
npm run lint          # next lint
npm run typecheck     # tsc --noEmit
npm run test          # vitest (heuristics unit tests, no network/API key needed)
```

## Project layout

```
app/
  page.tsx                 landing page
  humanize/page.tsx         editor page (renders components/Workspace)
  api/humanize/route.ts     streams a rewrite from Claude (NDJSON)
  api/fact-check/route.ts   structured-output fact-check (JSON schema + web search)
  api/analyze/route.ts      local heuristic scoring endpoint
components/                 UI components (Workspace is the main client component)
lib/
  prompts.ts                system prompts for humanize + fact-check
  heuristics.ts              local AI-writing-pattern scoring (+ heuristics.test.ts)
  anthropic.ts                server-side client resolution (BYOK header or env key)
  streamHumanize.ts           client-side NDJSON stream reader
```

## Notes on the humanize/fact-check API routes

- `/api/humanize` streams newline-delimited JSON events (`{"type":"delta"|"error"|"done"}`) so the rewrite can render as it arrives. A mid-stream failure (bad key, refusal, rate limit) surfaces as an `error` event rather than an HTTP status, since the response has already committed to a 200 stream by the time Claude's API is reached.
- `/api/fact-check` returns a normal JSON response using [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) and, when available, the web search tool; it retries once without web search if that tool is unavailable for the given key.
- Both cap input at 20,000 characters (`MAX_INPUT_CHARS` in `lib/types.ts`).
