export default function Footer() {
  return (
    <footer className="border-t border-ink-200/70 dark:border-ink-800">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-500 dark:text-ink-400">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-xl leading-relaxed">
            Humanizer edits toward plain, professional prose and flags the writing patterns
            most associated with unedited AI output. It does not guarantee a specific result
            against any third-party detector, and fact-check results are AI-assisted, not a
            verified-true stamp. Use good judgment, and disclose AI assistance where your
            institution or publication requires it.
          </p>
          <p className="whitespace-nowrap font-serif text-ink-400 dark:text-ink-500">
            Humanizer
          </p>
        </div>
      </div>
    </footer>
  );
}
