export function Sk({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-md bg-surface-2 ${className}`}
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
