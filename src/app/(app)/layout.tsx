import { LogOut } from "lucide-react";
import { AppNav } from "@/components/app-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-4 border-r border-line bg-bg p-4 md:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="text-sm font-semibold tracking-tight">
            Invoice Manager
          </span>
        </div>
        <AppNav />
        <form action="/auth/signout" method="POST" className="mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-surface hover:text-ink"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Keluar
          </button>
        </form>
      </aside>

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8 md:pb-12">
          {children}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <AppNav variant="bottom" />
      </div>
    </div>
  );
}
