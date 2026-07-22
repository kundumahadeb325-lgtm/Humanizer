const BEFORE =
  "In today's fast-paced digital landscape, our platform boasts a seamless, cutting-edge experience that truly unlocks your team's potential — it's not just a tool, it's a game-changer.";

const AFTER =
  "The platform lets teams track projects, assign tasks, and review progress from a single dashboard. In a survey of 200 customers, 78% reported a shorter onboarding time than their previous tool.";

const TAGS = ["buzzwords", "em dash", "negative parallelism", "vague claim of significance"];

export default function BeforeAfterExample() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="grid gap-6 rounded-2xl border border-ink-200 bg-white/60 p-6 dark:border-ink-800 dark:bg-ink-900/50 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-400">Before</p>
          <p className="mt-3 font-serif text-[1.05rem] leading-relaxed text-ink-500 dark:text-ink-400">
            {BEFORE}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-signal-bad/30 bg-signal-bad/5 px-2.5 py-0.5 text-[11px] text-signal-bad dark:bg-signal-bad/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-200 pt-6 dark:border-ink-800 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent dark:text-accent-light">
            After
          </p>
          <p className="mt-3 font-serif text-[1.05rem] leading-relaxed text-ink-900 dark:text-ink-50">
            {AFTER}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-signal-good">
            Plain, specific, checkable
          </p>
        </div>
      </div>
    </section>
  );
}
