import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Service-role client. NEVER import this from a Client Component or expose
// its key via NEXT_PUBLIC_*. Used only by the PIN-auth route handler and
// admin scripts that need to bypass RLS (e.g. minting a session, creating
// synthetic auth identities for new players/staff).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and Vercel project env vars) from the Supabase dashboard: Project Settings -> API -> service_role secret."
    );
  }
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
