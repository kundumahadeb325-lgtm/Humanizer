import Link from "next/link";
import BeforeAfterExample from "@/components/BeforeAfterExample";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ResponsibleUse from "@/components/ResponsibleUse";

export default function Home() {
  return (
    <main>
      <Hero />
      <BeforeAfterExample />
      <FeatureGrid />
      <HowItWorks />
      <ResponsibleUse />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink-900 px-8 py-10 dark:bg-ink-50 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-xl text-paper dark:text-ink-950">
              Bring your own Anthropic API key and start editing.
            </p>
            <p className="mt-1 text-sm text-ink-300 dark:text-ink-600">
              No account, no stored text, no subscription.
            </p>
          </div>
          <Link
            href="/humanize"
            className="whitespace-nowrap rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink-950 transition hover:bg-ink-100 dark:bg-ink-950 dark:text-paper dark:hover:bg-ink-800"
          >
            Open the editor
          </Link>
        </div>
      </section>
    </main>
  );
}
