"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireCoach } from "@/lib/auth/guards";
import type { Database } from "@/lib/supabase/types";

async function ensureReport(
  supabase: SupabaseClient<Database>,
  eventId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("game_reports")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase
    .from("game_reports")
    .insert({ event_id: eventId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export async function addGoal(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const side = String(formData.get("side"));
  const scorerJersey = formData.get("scorer_jersey")
    ? Number(formData.get("scorer_jersey"))
    : null;
  const assistJersey = formData.get("assist_jersey")
    ? Number(formData.get("assist_jersey"))
    : null;
  const minute = formData.get("minute") ? Number(formData.get("minute")) : null;
  const ownGoal = formData.get("own_goal") === "on";

  // A real goal means this is no longer an explicit confirmed 0-0.
  await supabase
    .from("game_reports")
    .update({ no_goals: false })
    .eq("id", reportId);

  const { error } = await supabase.from("goals").insert({
    report_id: reportId,
    side: side as "CHS" | "OPP",
    scorer_jersey: scorerJersey,
    assist_jersey: assistJersey,
    minute,
    own_goal: ownGoal,
  });
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function removeGoal(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id"));
  const eventId = String(formData.get("event_id"));
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function setNoGoals(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const checked = formData.get("no_goals") === "on";
  const { error } = await supabase
    .from("game_reports")
    .update(
      checked
        ? { no_goals: true, final_chs: null, final_opp: null }
        : { no_goals: false }
    )
    .eq("id", reportId);
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function setBackfillScore(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const finalChs = formData.get("final_chs")
    ? Number(formData.get("final_chs"))
    : null;
  const finalOpp = formData.get("final_opp")
    ? Number(formData.get("final_opp"))
    : null;
  const { error } = await supabase
    .from("game_reports")
    .update({ final_chs: finalChs, final_opp: finalOpp, no_goals: false })
    .eq("id", reportId);
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function addDiscipline(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const side = String(formData.get("side"));
  const jersey = formData.get("jersey") ? Number(formData.get("jersey")) : null;
  const card = String(formData.get("card"));
  const minute = formData.get("minute") ? Number(formData.get("minute")) : null;
  const { error } = await supabase.from("discipline").insert({
    report_id: reportId,
    side: side as "CHS" | "OPP",
    jersey,
    card: card as "Yellow" | "Red",
    minute,
  });
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function removeDiscipline(formData: FormData) {
  const supabase = await requireCoach();
  const id = String(formData.get("id"));
  const eventId = String(formData.get("event_id"));
  const { error } = await supabase.from("discipline").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function saveTeamStats(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const num = (key: string) =>
    formData.get(key) ? Number(formData.get(key)) : null;

  const { error } = await supabase.from("team_game_stats").upsert(
    {
      report_id: reportId,
      corners: num("corners"),
      free_kicks: num("free_kicks"),
      fouls: num("fouls"),
      possession_pct: num("possession_pct"),
      shots_conceded: num("shots_conceded"),
    },
    { onConflict: "report_id" }
  );
  if (error) throw error;
  revalidatePath(`/results/${eventId}`);
}

export async function savePlayerStats(formData: FormData) {
  const supabase = await requireCoach();
  const eventId = String(formData.get("event_id"));
  const reportId = await ensureReport(supabase, eventId);
  const playerIds = formData.getAll("player_id").map(String);

  const num = (key: string) => {
    const v = formData.get(key);
    return v ? Number(v) : 0;
  };

  for (const playerId of playerIds) {
    const { error } = await supabase.from("player_game_stats").upsert(
      {
        report_id: reportId,
        player_id: playerId,
        half1: formData.get(`half1_${playerId}`) === "on",
        half2: formData.get(`half2_${playerId}`) === "on",
        shots_on: num(`shots_on_${playerId}`),
        shots_off: num(`shots_off_${playerId}`),
        clearances: num(`clearances_${playerId}`),
        interceptions: num(`interceptions_${playerId}`),
        tackles_won: num(`tackles_won_${playerId}`),
        passes_completed: num(`passes_completed_${playerId}`),
        passes_missed: num(`passes_missed_${playerId}`),
        saves: num(`saves_${playerId}`),
      },
      { onConflict: "report_id,player_id" }
    );
    if (error) throw error;
  }
  revalidatePath(`/results/${eventId}`);
}
