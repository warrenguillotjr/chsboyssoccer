"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin, isValidPinFormat, syntheticEmailFor } from "@/lib/auth/pin";

export async function createStaff(formData: FormData) {
  await requireCoach(); // redirects if not a coach; the writes below still go through RLS-bypassing admin, so this check is what actually gates the action

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const pin = String(formData.get("pin") ?? "");
  const position = String(formData.get("position") ?? "").trim();
  const teamId = String(formData.get("team_id") ?? "") || null;

  if (!firstName || !lastName || !isValidPinFormat(pin) || !position) {
    throw new Error("Missing or invalid staff fields.");
  }

  const admin = createAdminClient();
  const pinHash = await hashPin(pin);

  const { data: staffRow, error: staffErr } = await admin
    .from("staff")
    .insert({ first_name: firstName, last_name: lastName, email, pin_hash: pinHash })
    .select("id")
    .single();
  if (staffErr) throw staffErr;

  // Synthetic identity: no real inbox, just an auth.users anchor so RLS's
  // auth.uid() and the access-token hook have something to key off of.
  const syntheticEmail = syntheticEmailFor("coach", staffRow.id);
  const { data: authUser, error: authErr } = await admin.auth.admin.createUser(
    { email: syntheticEmail, email_confirm: true }
  );
  if (authErr) throw authErr;

  const { error: linkErr } = await admin
    .from("staff")
    .update({ auth_user_id: authUser.user.id })
    .eq("id", staffRow.id);
  if (linkErr) throw linkErr;

  const { error: roleErr } = await admin.from("staff_roles").insert({
    staff_id: staffRow.id,
    role_type: teamId ? "team_coach" : "admin",
    team_id: teamId,
    position,
  });
  if (roleErr) throw roleErr;

  revalidatePath("/staff");
}

export async function addStaffRole(formData: FormData) {
  const supabase = await requireCoach();
  const staffId = String(formData.get("staff_id") ?? "");
  const position = String(formData.get("position") ?? "").trim();
  const teamId = String(formData.get("team_id") ?? "") || null;
  if (!staffId || !position) return;

  const { error } = await supabase.from("staff_roles").insert({
    staff_id: staffId,
    role_type: teamId ? "team_coach" : "admin",
    team_id: teamId,
    position,
  });
  if (error) throw error;
  revalidatePath("/staff");
}
