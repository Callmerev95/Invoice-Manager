"use client";

import type { ReactNode } from "react";

export function DeleteButton({
  action,
  id,
  children,
  confirmText,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  children: ReactNode;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-1.5 text-sm text-danger shadow-neu-sm transition-all hover:bg-danger/10 active:shadow-neu-in"
      >
        {children}
      </button>
    </form>
  );
}