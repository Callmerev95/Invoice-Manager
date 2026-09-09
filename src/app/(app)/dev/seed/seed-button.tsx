"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { seedDemoAction, type SeedResult } from "./actions";

export function SeedButton() {
  const [state, action, pending] = useActionState<SeedResult | undefined>(
    seedDemoAction,
    undefined
  );

  return (
    <div className="space-y-4">
      {state ? (
        state.ok ? (
          <div className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3">
            <p className="text-sm font-medium text-primary">Data contoh berhasil dibuat.</p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {state.summary.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {state.error}
          </p>
        )
      ) : null}

      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg shadow-neu-sm transition-all hover:bg-primary-hover disabled:opacity-60 disabled:shadow-none active:shadow-neu-in"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {pending ? "Mengisi data…" : "Isi data contoh"}
        </button>
      </form>
    </div>
  );
}