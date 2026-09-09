import Link from "next/link";
import type { Metadata } from "next";
import { loginAction } from "./actions";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export const metadata: Metadata = {
  title: "Masuk — Invoice Manager",
};

const ERRORS: Record<string, string> = {
  empty: "Masukkan email dan kata sandi.",
  invalid: "Email atau kata sandi salah.",
  auth: "Tidak bisa masuk. Coba lagi.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const message = error ? ERRORS[error] ?? ERRORS.auth : undefined;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Masuk</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Kelola invoice freelancer Anda.
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

      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Kata sandi" htmlFor="password">
          <PasswordInput id="password" name="password" autoComplete="current-password" />
        </Field>
        <Button type="submit" className="w-full">
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
          Daftar
        </Link>
      </p>
    </>
  );
}