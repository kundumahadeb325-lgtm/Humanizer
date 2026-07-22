export default function ResponsibleUse() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-6 dark:border-ink-800 dark:bg-ink-900/40 sm:p-8">
        <h2 className="font-serif text-xl text-ink-900 dark:text-ink-50">
          What this is, and isn&apos;t
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <p className="text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            Humanizer edits toward plain, professional writing and removes the specific
            patterns most associated with unedited AI output, things like em dashes,
            buzzword vocabulary, and inflated claims of significance. That tends to reduce
            false flags from AI detectors as a side effect of being better-edited prose.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            It is not a guaranteed bypass of any specific detector, including Quillbot or
            ZeroGPT, and the fact-checker is AI-assisted review, not a verified-true stamp.
            Read its output the way you&apos;d read a colleague&apos;s notes: useful, and worth
            checking yourself. Follow your institution&apos;s or publication&apos;s policy on
            disclosing AI assistance.
          </p>
        </div>
      </div>
    </section>
  );
}
