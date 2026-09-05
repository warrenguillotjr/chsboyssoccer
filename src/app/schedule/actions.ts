"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth/guards";

export async function createSeason(formData: FormData) {
  const supabase = await requireCoach();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  // seasons.one_open_season is a partial unique index -- this insert fails
  // loudly if a season is already open, rather than silently opening two.
  const { error } = await supabase.from("seasons").insert({ label });
  if (error) throw error;
  revalidatePath("/schedule");
  revalidatePath("/overview");
}

export async function createEvent(formData: FormData) {
  const supabase = await requireCoach();

  const seasonId = String(formData.get("season_id") ?? "");
  const type = String(formData.get("type") ?? "");
  const teamId = String(formData.get("team_id") ?? "") || null;
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") ?? "") || null;
  const endTime = String(formData.get("end_time") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;
  const opponentId = String(formData.get("opponent_id") ?? "") || null;
  const homeAway = String(formData.get("home_away") ?? "") || null;
  const district = formData.get("district") === "on";
  const playoff = formData.get("playoff") === "on";
  const gameNum = formData.get("game_num")
    ? Number(formData.get("game_num"))
    : null;
  const eventName = String(formData.get("event_name") ?? "").trim();

  if (!seasonId || !type || !date) throw new Error("Missing event fields.");

  // Titles are generated, matching the prototype: coaches type an opponent
  // or (for "Other") a free-text name, never a title directly.
  let opponentName: string | null = null;
  if (opponentId) {
    const { data: opponent } = await supabase
      .from("opponents")
      .select("name")
      .eq("id", opponentId)
      .single();
    opponentName = opponent?.name ?? null;
  }
  const title =
    type === "Other"
      ? eventName || "Other"
      : opponentName
        ? `${type} vs ${opponentName}`
        : type;

  const { error } = await supabase.from("events").insert({
    season_id: seasonId,
    type: type as "Practice" | "Game" | "Scrimmage" | "Classroom Session" | "Other",
    team_id: teamId,
    title,
    date,
    start_time: startTime,
    end_time: endTime,
    location,
    opponent_id: opponentId,
    home_away: homeAway as "Home" | "Away" | null,
    district,
    playoff,
    game_num: gameNum,
  });
  if (error) throw error;
  revalidatePath("/schedule");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/schedule");
}

export async function updateEvent(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;

  const { error } = await supabase
    .from("events")
    .update({ status: status as "Scheduled" | "Completed" | "Cancelled" | "Postponed", date, start_time: startTime, location })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/schedule");
  revalidatePath(`/schedule/${id}`);
}
