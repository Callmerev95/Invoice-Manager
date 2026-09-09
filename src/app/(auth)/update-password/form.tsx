"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import {
  updateRecoveryPasswordAction,
  type UpdatePasswordState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<UpdatePasswordState, FormData>(
    updateRecoveryPasswordAction,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      <Field label="Kata sandi baru" htmlFor="new_password">
        <PasswordInput
          id="new_password"
          name="new_password"
          autoComplete="new-password"
        />
      </Field>
      <Field label="Konfirmasi kata sandi baru" htmlFor="confirm_password">
        <PasswordInput
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
        />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {pending ? "Menyimpan…" : "Simpan kata sandi baru"}
      </Button>
    </form>
  );
}
