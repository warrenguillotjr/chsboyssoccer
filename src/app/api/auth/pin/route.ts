import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { isValidPinFormat, syntheticEmailFor, verifyPin } from "@/lib/auth/pin";
import {
  getClientIp,
  isIpLockedOut,
  recordAttempt,
} from "@/lib/auth/lockout";

const bodySchema = z.object({ pin: z.string() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isValidPinFormat(parsed.data.pin)) {
    return Response.json({ error: "Enter a 4-digit PIN." }, { status: 400 });
  }
  const { pin } = parsed.data;
  const clientIp = getClientIp(request);
  const admin = createAdminClient();

  if (await isIpLockedOut(admin, clientIp)) {
    return Response.json(
      {
        error:
          "Too many incorrect attempts. Please wait 15 minutes and try again.",
      },
      { status: 429 }
    );
  }

  // Mirrors the prototype's two-branch submitLogin: coaches first, then
  // players. PINs are hashed, so every candidate must be bcrypt-compared --
  // there's no way to look one up by equality.
  const { data: staffRows, error: staffErr } = await admin
    .from("staff")
    .select("id, pin_hash, auth_user_id");
  if (staffErr) throw staffErr;

  for (const row of staffRows ?? []) {
    if (await verifyPin(pin, row.pin_hash)) {
      return signInAs("coach", row.id, row.auth_user_id, admin, clientIp);
    }
  }

  const { data: playerRows, error: playerErr } = await admin
    .from("players")
    .select("id, pin_hash, auth_user_id");
  if (playerErr) throw playerErr;

  for (const row of playerRows ?? []) {
    if (await verifyPin(pin, row.pin_hash)) {
      return signInAs("player", row.id, row.auth_user_id, admin, clientIp);
    }
  }

  await recordAttempt(admin, {
    identityType: "unknown",
    identityId: null,
    clientIp,
    succeeded: false,
  });
  return Response.json({ error: "Incorrect PIN." }, { status: 401 });
}

async function signInAs(
  role: "coach" | "player",
  identityId: string,
  authUserId: string | null,
  admin: ReturnType<typeof createAdminClient>,
  clientIp: string
) {
  if (!authUserId) {
    // Should not happen once creation flows are wired up, but fail loudly
    // rather than silently letting a PIN match with no session to mint.
    return Response.json(
      { error: "Account not fully set up. Contact a coach." },
      { status: 500 }
    );
  }

  const email = syntheticEmailFor(role, identityId);
  const { data: linkData, error: linkErr } =
    await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (linkErr) throw linkErr;

  const supabase = await createServerSupabase();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
    email,
  });
  if (verifyErr) throw verifyErr;

  await recordAttempt(admin, {
    identityType: role === "coach" ? "staff" : "player",
    identityId,
    clientIp,
    succeeded: true,
  });

  return Response.json({ ok: true, role });
}
