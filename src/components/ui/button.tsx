import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-bg font-semibold hover:bg-primary-hover disabled:opacity-60",
  ghost:
    "border border-line-strong text-ink hover:bg-surface-2 disabled:opacity-60",
  danger:
    "bg-danger/10 text-danger font-semibold hover:bg-danger/20 disabled:opacity-60",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}