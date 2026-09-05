"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin, isValidPinFormat, syntheticEmailFor } from "@/lib/auth/pin";

export async function createPlayer(formData: FormData) {
  await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const teamId = String(formData.get("team_id") ?? "");
  const jersey = formData.get("jersey")
    ? Number(formData.get("jersey"))
    : null;
  const positions = String(formData.get("positions") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const gradeLevel = formData.get("grade_level")
    ? Number(formData.get("grade_level"))
    : null;
  const gradYear = formData.get("grad_year")
    ? Number(formData.get("grad_year"))
    : null;
  const captain = formData.get("captain") === "on";
  const pin = String(formData.get("pin") ?? "");

  if (!name || !teamId || !isValidPinFormat(pin)) {
    throw new Error("Missing or invalid player fields.");
  }

  const admin = createAdminClient();
  const pinHash = await hashPin(pin);

  const { data: playerRow, error: playerErr } = await admin
    .from("players")
    .insert({
      name,
      team_id: teamId,
      jersey,
      positions,
      grade_level: gradeLevel,
      grad_year: gradYear,
      captain,
      pin_hash: pinHash,
    })
    .select("id")
    .single();
  if (playerErr) throw playerErr;

  const syntheticEmail = syntheticEmailFor("player", playerRow.id);
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser(
    { email: syntheticEmail, email_confirm: true }
  );
  if (authErr) throw authErr;

  const { error: linkErr } = await admin
    .from("players")
    .update({ auth_user_id: authUser.user.id })
    .eq("id", playerRow.id);
  if (linkErr) throw linkErr;

  revalidatePath("/roster");
}
