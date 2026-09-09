import { LoadingStatus, Sk } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <LoadingStatus label="Memuat invoice…" />
      <Sk className="h-4 w-20" />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sk className="h-6 w-48" />
            <Sk className="h-5 w-16 rounded-full" />
          </div>
          <Sk className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Sk className="h-8 w-32" />
          <Sk className="h-8 w-32" />
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-neu-out">
        <Sk className="h-28 w-full rounded-none bg-surface" />
        <div className="space-y-3 px-5 py-4">
          <Sk className="h-4 w-full" />
          <Sk className="h-4 w-3/4" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-neu-in">
        <Sk className="h-9 w-full rounded-none bg-surface" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-line/60 px-4 py-3 last:border-b-0"
          >
            <Sk className="h-4 w-1/2" />
            <Sk className="ml-auto h-4 w-24" />
          </div>
        ))}
      </section>
    </div>
  );
}
