const FEATURES = [
  {
    title: "Formal, senior-editor register",
    body: "Plain, precise, professional prose — the version of a draft that goes out the door, not the version fresh off a chat window.",
  },
  {
    title: "Zero figurative language",
    body: "No metaphors, similes, or idioms. If the source says the market was 'a rollercoaster,' the rewrite says what actually happened.",
  },
  {
    title: "No filler, no fluff",
    body: "Hedging, throat-clearing, and padding sentences are cut. Every sentence left in the rewrite carries information.",
  },
  {
    title: "Pattern-aware editing",
    body: "The editor flags em dashes, buzzword vocabulary, inflated significance claims, and other tells of unedited AI writing, before and after.",
  },
  {
    title: "Built-in fact-checking",
    body: "A separate pass extracts the checkable claims in your draft and marks each one supported, disputed, unverifiable, or needing context.",
  },
  {
    title: "Bring your own key",
    body: "Your Anthropic API key stays in your browser and is sent only with your own requests. Nothing is logged or stored server-side.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-serif text-2xl text-ink-900 dark:text-ink-50">
        What the editor actually does
      </h2>
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <h3 className="text-[15px] font-semibold text-ink-900 dark:text-ink-50">{f.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
