"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, LayoutTemplate, Receipt, Settings } from "lucide-react";
import type { ComponentType } from "react";

const items: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/templates", label: "Template", icon: LayoutTemplate },
  { href: "/invoices", label: "Invoice", icon: Receipt },
  { href: "/settings", label: "Setelan", icon: Settings },
];

export function AppNav({ variant = "sidebar" }: { variant?: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const isBottom = variant === "bottom";

  return (
    <nav
      aria-label="Navigasi utama"
      className={clsx(isBottom ? "flex" : "flex-1 flex-col gap-1")}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center rounded-md text-sm transition-colors",
              isBottom
                ? "flex-1 flex-col justify-center gap-1 py-1.5"
                : "gap-3 px-3 py-2",
              active
                ? "bg-surface-2 font-medium text-primary"
                : "text-ink-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon className={clsx(isBottom ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}