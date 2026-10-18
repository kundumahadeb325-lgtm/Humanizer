import type { AnalysisResult } from "@/lib/types";

function toneFor(score: number): { text: string; bar: string } {
  if (score <= 20) return { text: "text-signal-good", bar: "bg-signal-good" };
  if (score <= 50) return { text: "text-signal-warn", bar: "bg-signal-warn" };
  return { text: "text-signal-bad", bar: "bg-signal-bad" };
}

export default function ScoreMeter({
  label,
  analysis,
}: {
  label: string;
  analysis: AnalysisResult | null;
}) {
  if (!analysis || analysis.wordCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-400 dark:border-ink-700">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-2">Nothing to analyze yet.</p>
      </div>
    );
  }

  const tone = toneFor(analysis.score);

  return (
    <div className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className={`font-serif text-2xl ${tone.text}`}>{analysis.score}</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div
          className={`h-full rounded-full ${tone.bar} transition-all`}
          style={{ width: `${analysis.score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-ink-400">
        {analysis.wordCount.toLocaleString()} words · {analysis.sentenceCount} sentences · avg{" "}
        {analysis.avgSentenceLength} words/sentence
      </p>

      {analysis.flags.length > 0 ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer select-none text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100">
            {analysis.flags.length} pattern{analysis.flags.length === 1 ? "" : "s"} flagged
          </summary>
          <ul className="mt-2 space-y-2.5">
            {analysis.flags.map((flag) => (
              <li key={flag.id} className="border-l-2 border-ink-200 pl-3 dark:border-ink-700">
                <p className="text-[13px] font-medium text-ink-700 dark:text-ink-200">
                  {flag.label} <span className="text-ink-400">×{flag.count}</span>
                </p>
                {flag.examples.map((ex, i) => (
                  <p key={i} className="mt-0.5 truncate text-xs italic text-ink-400">
                    &ldquo;{ex}&rdquo;
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <p className="mt-3 text-sm text-signal-good">No flagged patterns.</p>
      )}
    </div>
  );
}
