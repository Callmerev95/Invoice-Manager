import { APP_AUTHOR, APP_MAJOR, APP_NAME, APP_VERSION } from "@/lib/app-meta";

export function AppFooter({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={
        tone === "dark"
          ? "mt-10 text-center text-xs text-ink-faint"
          : "mt-6 text-center text-xs text-neutral-500"
      }
    >
      <p title={`v${APP_VERSION}`}>
        © {year} {APP_AUTHOR} • {APP_NAME} V{APP_MAJOR}
      </p>
    </footer>
  );
}
