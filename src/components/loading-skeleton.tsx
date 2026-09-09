export function Sk({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-xl bg-surface-2 shadow-neu-sm ${className}`}
    />
  );
}

export function LoadingStatus({ label = "Memuat…" }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}
