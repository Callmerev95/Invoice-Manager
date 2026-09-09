"use client";

import type { ReactNode } from "react";

export function ConfirmAction({
  action,
  hidden,
  confirmText,
  children,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  confirmText: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input type="hidden" key={k} name={k} value={v} />
      ))}
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center gap-2 rounded-md border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
        }
      >
        {children}
      </button>
    </form>
  );
}