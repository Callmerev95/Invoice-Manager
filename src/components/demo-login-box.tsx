"use client";

import { useState } from "react";
import { DEMO_EMAIL } from "@/lib/demo";

export function DemoLoginBox() {
  const [filled, setFilled] = useState(false);
  const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";
  if (!password) return null;

  function fill() {
    const emailEl = document.getElementById("email") as HTMLInputElement | null;
    const passEl = document.getElementById("password") as HTMLInputElement | null;
    if (emailEl) emailEl.value = DEMO_EMAIL;
    if (passEl) passEl.value = password;
    setFilled(true);
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-line-strong px-4 py-3">
      <p className="text-sm font-medium text-ink">Coba live demo</p>
      <p className="mt-1 text-sm text-ink-muted">
        Akun publik berisi data contoh: <span className="tabular-nums">{DEMO_EMAIL}</span>
      </p>
      <button
        type="button"
        onClick={fill}
        className="mt-2 inline-flex min-h-[44px] items-center rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2"
      >
        {filled ? "Terisi — silakan tekan Masuk" : "Isi otomatis"}
      </button>
    </div>
  );
}
