import { LoadingStatus, Sk } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <LoadingStatus label="Memuat daftar invoice…" />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Sk className="h-7 w-32" />
          <Sk className="h-4 w-72" />
        </div>
        <Sk className="h-9 w-36" />
      </header>

      <nav aria-label="Filter status" className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Sk key={i} className="h-7 w-20 rounded-full" />
        ))}
      </nav>

      <div className="overflow-hidden rounded-lg border border-line">
        <Sk className="h-9 w-full rounded-none border-b border-line bg-surface" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0"
          >
            <Sk className="h-4 w-28" />
            <Sk className="h-4 w-32" />
            <Sk className="hidden h-4 w-24 lg:block" />
            <Sk className="hidden h-4 w-24 md:block" />
            <Sk className="h-5 w-16" />
            <Sk className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
