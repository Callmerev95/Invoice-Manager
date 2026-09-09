import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { UpdatePasswordForm } from "./form";

export const metadata: Metadata = {
  title: "Atur kata sandi baru — Invoice Manager",
};

export default async function UpdatePasswordPage() {
  // Lolos hanya dengan sesi valid (mis. sesi pemulihan dari tautan email).
  await requireUser();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Atur kata sandi baru
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Tautan pemulihan valid. Masukkan kata sandi baru Anda.
        </p>
      </div>

      <UpdatePasswordForm />
    </>
  );
}
