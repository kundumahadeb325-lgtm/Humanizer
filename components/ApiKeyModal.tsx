"use client";

import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  initialKey: string;
  onClose: () => void;
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ open, initialKey, onClose, onSave }: Props) {
  const [value, setValue] = useState(initialKey);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (open) setValue(initialKey);
  }, [open, initialKey]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
        className="w-full max-w-md rounded-2xl border border-ink-200 bg-paper p-6 shadow-xl dark:border-ink-700 dark:bg-ink-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="api-key-modal-title" className="font-serif text-lg text-ink-900 dark:text-ink-50">
          Anthropic API key
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          Stored only in this browser&apos;s local storage and sent solely with your own
          requests. Never sent anywhere else, never logged.
        </p>

        <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink-400">
          API key
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-950">
          <input
            type={reveal ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-ant-..."
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-ink-900 outline-none dark:text-ink-100"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="shrink-0 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          >
            {reveal ? "Hide" : "Show"}
          </button>
        </div>

        <p className="mt-2 text-xs text-ink-400">
          Don&apos;t have one? Create a key at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-ink-300 underline-offset-2 hover:text-ink-700 dark:hover:text-ink-200"
          >
            console.anthropic.com
          </a>
          .
        </p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setValue("");
              onSave("");
            }}
            className="text-sm text-ink-400 hover:text-signal-bad"
          >
            Clear key
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(value.trim())}
              className="rounded-full bg-ink-900 px-5 py-2 text-sm font-medium text-paper hover:bg-ink-700 dark:bg-ink-50 dark:text-ink-950 dark:hover:bg-ink-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
