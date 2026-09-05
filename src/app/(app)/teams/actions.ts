"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth/guards";

export async function createTeam(formData: FormData) {
  const supabase = await requireCoach();
  const name = String(formData.get("name") ?? "").trim();
  const isVarsity = formData.get("is_varsity") === "on";
  if (!name) return;
  const { error } = await supabase
    .from("teams")
    .insert({ name, is_varsity: isVarsity });
  if (error) throw error;
  revalidatePath("/teams");
}

export async function archiveTeam(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("teams")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/teams");
}

export async function createOpponent(formData: FormData) {
  const supabase = await requireCoach();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const { error } = await supabase.from("opponents").insert({ name });
  if (error) throw error;
  revalidatePath("/teams");
}

export async function archiveOpponent(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id") ?? "");
  // Opponents already referenced by a schedule event can't be removed --
  // `events.opponent_id` is ON DELETE RESTRICT and we never hard-delete
  // here anyway, but archiving still hides them from future dropdowns.
  const { error } = await supabase
    .from("opponents")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/teams");
}
