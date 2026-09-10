/** Akun demo publik (kredensial fake, hanya untuk environment demo terpisah). */
export const DEMO_EMAIL = "demo@test.com";

function demoEmailList(): string[] {
  return (process.env.DEMO_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return demoEmailList().includes(email.trim().toLowerCase());
}

/** Seeder boleh jalan di non-production, atau di production hanya untuk email demo bila flag aktif. */
export function canRunSeeder(email: string | null | undefined): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return (
    process.env.ALLOW_DEMO_SEED === "true" && isDemoEmail(email)
  );
}

/** Halaman /dev/seed boleh dibuka (cek env saja; aksi tetap cek email). */
export function isSeederPageEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEMO_SEED === "true"
  );
}
