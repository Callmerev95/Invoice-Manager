import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-bg font-semibold shadow-neu-sm hover:bg-primary-hover disabled:opacity-60 disabled:shadow-none active:shadow-neu-in",
  ghost:
    "bg-surface text-ink shadow-neu-sm hover:bg-surface-2 disabled:opacity-60 disabled:shadow-none active:shadow-neu-in",
  danger:
    "bg-danger/10 text-danger font-semibold shadow-neu-sm hover:bg-danger/20 disabled:opacity-60 disabled:shadow-none active:shadow-neu-in",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 min-h-[44px] text-sm transition-all disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}