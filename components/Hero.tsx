import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pt-24">
      <p className="font-sans text-xs uppercase tracking-[0.22em] text-accent dark:text-accent-light">
        For writers who ship under their own name
      </p>
      <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-ink-900 dark:text-ink-50 sm:text-5xl sm:leading-tight">
        Turn AI-assisted drafts into prose a senior editor would sign off on.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 dark:text-ink-300">
        Humanizer rewrites text into clean, formal, professional language, no filler, no
        fluff, no metaphors, and checks the underlying facts before you publish.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Link
          href="/humanize"
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink-700 dark:bg-ink-50 dark:text-ink-950 dark:hover:bg-ink-200"
        >
          Open the editor
        </Link>
        <a
          href="#how-it-works"
          className="rounded-full border border-ink-300 px-6 py-3 text-sm font-medium text-ink-700 transition hover:border-ink-500 hover:text-ink-900 dark:border-ink-700 dark:text-ink-200 dark:hover:border-ink-500 dark:hover:text-ink-50"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
