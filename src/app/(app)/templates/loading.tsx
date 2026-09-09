import { LoadingStatus, Sk } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <LoadingStatus label="Memuat daftar template…" />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Sk className="h-7 w-36" />
          <Sk className="h-4 w-80" />
        </div>
        <Sk className="h-9 w-40" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Sk className="h-5 w-32" />
                <Sk className="h-4 w-44" />
              </div>
              <Sk className="h-8 w-8" />
            </div>
            <div className="mt-4 space-y-2">
              <Sk className="h-4 w-full" />
              <Sk className="h-4 w-full" />
              <Sk className="h-4 w-2/3" />
            </div>
            <Sk className="mt-4 h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
