import Link from "next/link";
import type { Metadata } from "next";
import { signupAction } from "./actions";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export const metadata: Metadata = {
  title: "Daftar — Invoice Manager",
};

const ERRORS: Record<string, string> = {
  empty: "Masukkan email dan kata sandi.",
  short: "Kata sandi minimal 8 karakter.",
  exists: "Email sudah terdaftar. Masuk saja.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const message = error ? ERRORS[error] ?? error : undefined;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Buat akun</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gratis untuk penggunaan sendiri.
        </p>
      </div>

      {sent ? (
        <p
          role="status"
          className="mb-4 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          Cek email Anda untuk tautan konfirmasi, lalu masuk.
        </p>
      ) : null}

      {message ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {message}
        </p>
      ) : null}

      <form action={signupAction} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field
          label="Kata sandi"
          htmlFor="password"
          hint="Minimal 8 karakter."
        >
          <PasswordInput id="password" name="password" autoComplete="new-password" />
        </Field>
        <Button type="submit" className="w-full">
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
          Masuk
        </Link>
      </p>
    </>
  );
}