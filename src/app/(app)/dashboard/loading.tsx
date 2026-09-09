import { LoadingStatus, Sk } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <LoadingStatus label="Memuat beranda…" />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Sk className="h-7 w-36" />
          <Sk className="h-4 w-64" />
        </div>
        <Sk className="h-9 w-36" />
      </header>

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-surface p-4 shadow-neu-out">
            <Sk className="h-3 w-20" />
            <Sk className="mt-2.5 h-6 w-24" />
          </div>
        ))}
      </section>

      <section aria-label="Invoice terbaru">
        <div className="mb-3 flex items-center justify-between">
          <Sk className="h-5 w-36" />
          <Sk className="h-4 w-24" />
        </div>
        <div className="overflow-hidden rounded-2xl bg-surface shadow-neu-in">
          <Sk className="h-9 w-full rounded-none bg-surface" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-line/60 px-4 py-3 last:border-b-0"
            >
              <Sk className="h-4 w-28" />
              <Sk className="h-4 w-32" />
              <Sk className="hidden h-4 w-24 sm:block" />
              <Sk className="h-5 w-16" />
              <Sk className="ml-auto h-4 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
