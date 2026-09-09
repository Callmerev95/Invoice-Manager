"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type UpdatePasswordState = { error?: string } | undefined;

export async function updateRecoveryPasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  await requireUser();
  const password = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8)
    return { error: "Kata sandi minimal 8 karakter." };
  if (password !== confirm)
    return { error: "Konfirmasi kata sandi tidak cocok." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Gagal mengganti kata sandi. Coba lagi." };

  // Sesi pemulihan sekali pakai: keluar lalu arahkan ke login.
  await supabase.auth.signOut();
  redirect("/login?reset=1");
}
