import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

// No real inbox behind either address -- just an anchor so every player/staff
// row has a real auth.users row for RLS's auth.uid() and for the custom
// access token hook to key its role/team_id claims off of.
export function syntheticEmailFor(
  role: "coach" | "player",
  id: string
): string {
  return role === "coach"
    ? `staff-${id}@staff.internal`
    : `player-${id}@players.internal`;
}
