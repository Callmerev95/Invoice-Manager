export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="text-sm font-semibold tracking-tight">
            Invoice Manager
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}