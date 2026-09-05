import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth/session";

export async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return supabase;
}

// UI-level convenience only -- RLS's is_coach() is the real enforcement
// (see the phase1_schema migration's coach_all policies), so a mistake here
// fails closed at the database, not open.
export async function requireCoach() {
  const supabase = await createClient();
  const role = await getCurrentRole(supabase);
  if (role !== "coach") redirect("/sign-in");
  return supabase;
}
