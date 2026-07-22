"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ApiKeyModal from "./ApiKeyModal";
import ClaimList from "./ClaimList";
import ScoreMeter from "./ScoreMeter";
import { analyzeText } from "@/lib/heuristics";
import { streamHumanize } from "@/lib/streamHumanize";
import { MAX_INPUT_CHARS, type FactCheckResult } from "@/lib/types";

const STORAGE_KEY = "humanizer_api_key";
type Tab = "humanize" | "fact-check";

export default function Workspace() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizeError, setHumanizeError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("humanize");
  const [factCheck, setFactCheck] = useState<FactCheckResult | null>(null);
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [factCheckError, setFactCheckError] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem(STORAGE_KEY) ?? "");
    } catch {
      // localStorage unavailable (private mode, etc.) — key entry just won't persist
    }
  }, []);

  const inputAnalysis = useMemo(() => analyzeText(inputText), [inputText]);
  const outputAnalysis = useMemo(() => analyzeText(outputText), [outputText]);

  function saveKey(key: string) {
    setApiKey(key);
    try {
      if (key) localStorage.setItem(STORAGE_KEY, key);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures — the key still works for this session
    }
    setSettingsOpen(false);
  }

  async function handleHumanize() {
    if (!inputText.trim() || isHumanizing) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsHumanizing(true);
    setHumanizeError(null);
    setOutputText("");

    await streamHumanize(
      inputText,
      apiKey || undefined,
      {
        onDelta: (text) => setOutputText((prev) => prev + text),
        onError: (message) => setHumanizeError(message),
        onDone: () => {},
      },
      controller.signal,
    );

    if (abortRef.current === controller) setIsHumanizing(false);
  }

  async function handleFactCheck() {
    const source = outputText.trim() || inputText.trim();
    if (!source || isFactChecking) return;

    setIsFactChecking(true);
    setFactCheckError(null);
    setFactCheck(null);

    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, apiKey: apiKey || undefined }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Fact-check failed. Please try again.";
        setFactCheckError(message);
      } else {
        setFactCheck(data as FactCheckResult);
      }
    } catch {
      setFactCheckError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsFactChecking(false);
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    setInputText("");
    setOutputText("");
    setHumanizeError(null);
    setFactCheck(null);
    setFactCheckError(null);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(outputText);
    } catch {
      // clipboard access denied — nothing we can do without a fallback UI
    }
  }

  function handleDownload() {
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const factCheckSourceLabel = outputText.trim() ? "humanized rewrite" : "original text";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink-900 dark:text-ink-50">Editor</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Paste a draft, rewrite it, then check the facts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3.5 py-2 text-sm text-ink-600 transition hover:border-ink-400 hover:text-ink-900 dark:border-ink-700 dark:text-ink-300 dark:hover:border-ink-500 dark:hover:text-ink-50"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-4 w-4">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 13a7.9 7.9 0 0 0 0-2l2-1.5-2-3.5-2.4.6a8 8 0 0 0-1.7-1L14.8 3h-4l-.5 2.6a8 8 0 0 0-1.7 1l-2.4-.6-2 3.5L6.2 11a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.5 2.4-.6a8 8 0 0 0 1.7 1l.5 2.6h4l.5-2.6a8 8 0 0 0 1.7-1l2.4.6 2-3.5-2-1.5Z" />
          </svg>
          {apiKey ? "Key set" : "Add API key"}
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="source-text" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Original text
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-ink-400 hover:text-signal-bad"
            >
              Clear
            </button>
          </div>
          <textarea
            id="source-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, MAX_INPUT_CHARS))}
            rows={16}
            placeholder="Paste an AI-assisted draft here…"
            className="thin-scroll mt-1.5 w-full resize-y rounded-xl border border-ink-200 bg-white p-4 text-[15px] leading-relaxed text-ink-900 outline-none transition focus:border-accent dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
          />
          <p className="mt-1 text-right text-xs text-ink-400">
            {inputText.length.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()} characters
          </p>

          <div className="mt-4">
            <ScoreMeter label="Pattern score — original" analysis={inputAnalysis} />
          </div>
        </div>

        <div>
          <div className="flex gap-1 rounded-full bg-ink-100 p-1 dark:bg-ink-800">
            <button
              type="button"
              data-testid="tab-humanize"
              onClick={() => setActiveTab("humanize")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm transition ${
                activeTab === "humanize"
                  ? "bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-ink-50"
                  : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Humanize
            </button>
            <button
              type="button"
              data-testid="tab-fact-check"
              onClick={() => setActiveTab("fact-check")}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm transition ${
                activeTab === "fact-check"
                  ? "bg-white text-ink-900 shadow-sm dark:bg-ink-950 dark:text-ink-50"
                  : "text-ink-500 dark:text-ink-400"
              }`}
            >
              Fact-check
            </button>
          </div>

          {activeTab === "humanize" ? (
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Humanized rewrite
                </label>
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="text-ink-400 hover:text-ink-800 disabled:opacity-40 dark:hover:text-ink-100"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!outputText}
                    className="text-ink-400 hover:text-ink-800 disabled:opacity-40 dark:hover:text-ink-100"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="thin-scroll mt-1.5 h-[19.5rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-ink-200 bg-white p-4 text-[15px] leading-relaxed text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50">
                {outputText ||
                  (isHumanizing ? (
                    <span className="animate-pulse text-ink-400">Rewriting…</span>
                  ) : (
                    <span className="text-ink-300 dark:text-ink-600">
                      Your rewrite will appear here.
                    </span>
                  ))}
              </div>

              {humanizeError && (
                <p role="alert" className="mt-2 text-sm text-signal-bad">
                  {humanizeError}
                </p>
              )}

              <button
                type="button"
                data-testid="humanize-submit"
                onClick={handleHumanize}
                disabled={isHumanizing || !inputText.trim()}
                className="mt-4 w-full rounded-full bg-ink-900 py-3 text-sm font-medium text-paper transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-ink-50 dark:text-ink-950 dark:hover:bg-ink-200"
              >
                {isHumanizing ? "Rewriting…" : "Humanize"}
              </button>

              <div className="mt-4">
                <ScoreMeter
                  label="Pattern score — rewrite"
                  analysis={outputText ? outputAnalysis : null}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-ink-400">
                  Fact-check
                </label>
                <p className="text-xs text-ink-400">Checking: {factCheckSourceLabel}</p>
              </div>

              <button
                type="button"
                data-testid="fact-check-submit"
                onClick={handleFactCheck}
                disabled={isFactChecking || !(inputText.trim() || outputText.trim())}
                className="mt-3 w-full rounded-full bg-ink-900 py-3 text-sm font-medium text-paper transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-ink-50 dark:text-ink-950 dark:hover:bg-ink-200"
              >
                {isFactChecking ? "Checking facts…" : "Run fact-check"}
              </button>

              {factCheckError && (
                <p role="alert" className="mt-2 text-sm text-signal-bad">
                  {factCheckError}
                </p>
              )}

              <div className="thin-scroll mt-4 max-h-[26rem] overflow-y-auto pr-1">
                {factCheck ? (
                  <ClaimList result={factCheck} />
                ) : (
                  <p className="text-sm text-ink-400">
                    {isFactChecking
                      ? "Extracting and checking claims…"
                      : "Results will appear here — claims are marked supported, disputed, unverifiable, or needing context."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ApiKeyModal
        open={settingsOpen}
        initialKey={apiKey}
        onClose={() => setSettingsOpen(false)}
        onSave={saveKey}
      />
    </div>
  );
}
