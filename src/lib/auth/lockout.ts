import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// 4-digit PINs are only 10,000 combinations -- lock out an IP that's
// clearly guessing rather than typing, before we even check the PIN.
export const LOCKOUT_THRESHOLD = 8;
export const LOCKOUT_WINDOW_MINUTES = 15;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function isIpLockedOut(
  admin: SupabaseClient<Database>,
  clientIp: string
): Promise<boolean> {
  const since = new Date(
    Date.now() - LOCKOUT_WINDOW_MINUTES * 60_000
  ).toISOString();
  const { count, error } = await admin
    .from("auth_attempts")
    .select("id", { count: "exact", head: true })
    .eq("client_ip", clientIp)
    .eq("succeeded", false)
    .gte("attempted_at", since);
  if (error) throw error;
  return (count ?? 0) >= LOCKOUT_THRESHOLD;
}

export async function recordAttempt(
  admin: SupabaseClient<Database>,
  params: {
    identityType: "player" | "staff" | "unknown";
    identityId: string | null;
    clientIp: string;
    succeeded: boolean;
  }
): Promise<void> {
  const { error } = await admin.from("auth_attempts").insert({
    identity_type: params.identityType,
    identity_id: params.identityId,
    client_ip: params.clientIp,
    succeeded: params.succeeded,
  });
  if (error) throw error;
}
