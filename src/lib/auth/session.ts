import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Role = "coach" | "player" | null;

// auth_role() reads the custom `role` claim the access-token hook embeds at
// sign-in (see the phase1_schema migration) -- this is a plain RPC call, not
// a second source of truth for identity.
export async function getCurrentRole(
  supabase: SupabaseClient<Database>
): Promise<Role> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("auth_role");
  if (error || !data) return null;
  return data === "coach" || data === "player" ? data : null;
}
