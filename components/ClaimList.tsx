import type { ClaimVerdict, FactCheckResult } from "@/lib/types";

const VERDICT_META: Record<ClaimVerdict, { label: string; className: string }> = {
  supported: { label: "Supported", className: "bg-signal-good/10 text-signal-good border-signal-good/30" },
  disputed: { label: "Disputed", className: "bg-signal-bad/10 text-signal-bad border-signal-bad/30" },
  needs_context: {
    label: "Needs context",
    className: "bg-signal-warn/10 text-signal-warn border-signal-warn/30",
  },
  unverifiable: {
    label: "Unverifiable",
    className: "bg-ink-200/40 text-ink-500 border-ink-300 dark:bg-ink-700/40 dark:text-ink-300 dark:border-ink-600",
  },
};

export default function ClaimList({ result }: { result: FactCheckResult }) {
  return (
    <div>
      <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4 text-sm leading-relaxed text-ink-600 dark:border-ink-700 dark:bg-ink-900/40 dark:text-ink-300">
        <p>{result.summary}</p>
        {!result.usedWebSearch && (
          <p className="mt-2 text-xs text-ink-400">
            Based on the model&apos;s own knowledge — live web search wasn&apos;t available for
            this request.
          </p>
        )}
      </div>

      {result.claims.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">
          No independently checkable factual claims were found in this text.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {result.claims.map((claim, i) => {
            const meta = VERDICT_META[claim.verdict];
            return (
              <li key={i} className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] leading-snug text-ink-900 dark:text-ink-50">
                    &ldquo;{claim.claim}&rdquo;
                  </p>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {claim.explanation}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                  <span>Confidence: {claim.confidence}</span>
                  {claim.sources.length > 0 && <span>Sources: {claim.sources.join(", ")}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
