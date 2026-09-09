"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = { error?: string } | undefined;

export async function updatePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
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

  revalidatePath("/settings");
  redirect("/settings?password=1");
}
