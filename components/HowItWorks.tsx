const STEPS = [
  {
    n: "01",
    title: "Paste your draft",
    body: "Drop in anything from a paragraph to a full article — up to about 4,000 words at a time.",
  },
  {
    n: "02",
    title: "Rewrite, then check the score",
    body: "The editor rewrites it in a formal, plain register and shows a before/after pattern score so you can see exactly what changed.",
  },
  {
    n: "03",
    title: "Fact-check and ship",
    body: "Run the fact-checker on the result, resolve anything flagged, then copy or download the final text.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-serif text-2xl text-ink-900 dark:text-ink-50">How it works</h2>
      <div className="mt-8 grid gap-10 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n}>
            <p className="font-serif text-3xl text-ink-200 dark:text-ink-700">{step.n}</p>
            <h3 className="mt-2 text-[15px] font-semibold text-ink-900 dark:text-ink-50">
              {step.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
