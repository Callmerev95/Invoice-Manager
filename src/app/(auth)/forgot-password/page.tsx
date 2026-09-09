import Link from "next/link";
import type { Metadata } from "next";
import { requestPasswordResetAction } from "./actions";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lupa kata sandi — Invoice Manager",
};

const ERRORS: Record<string, string> = {
  empty: "Masukkan email akun Anda.",
  ratelimit:
    "Terlalu banyak permintaan tautan. Tunggu sekitar 1 jam lalu coba sekali lagi.",
  auth: "Tidak bisa memproses. Coba lagi.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const message = error ? ERRORS[error] ?? ERRORS.auth : undefined;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Lupa kata sandi</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Masukkan email akun. Tautan pemulihan akan dikirim bila email terdaftar.
        </p>
      </div>

      {message ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {message}
        </p>
      ) : null}
      {sent === "1" ? (
        <p className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          Bila email terdaftar, tautan pemulihan telah dikirim. Periksa kotak
          masuk (dan folder spam), lalu klik tautan di email tersebut.
        </p>
      ) : null}

      <form action={requestPasswordResetAction} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Button type="submit" className="w-full">
          Kirim tautan pemulihan
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Ingat kata sandi?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Masuk
        </Link>
      </p>
    </>
  );
}
