import { notFound } from "next/navigation";
import { requireCoach } from "@/lib/auth/guards";
import {
  addDiscipline,
  addGoal,
  removeDiscipline,
  removeGoal,
  savePlayerStats,
  saveTeamStats,
  setBackfillScore,
  setNoGoals,
} from "../actions";

export default async function UpdateResultPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await requireCoach();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, date, opponent_id, teams(id, name, is_varsity), opponents(name)")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) notFound();

  const { data: report } = await supabase
    .from("game_reports")
    .select("id, no_goals, final_chs, final_opp")
    .eq("event_id", eventId)
    .maybeSingle();

  const reportId = report?.id ?? null;

  const [{ data: goals }, { data: discipline }, { data: teamStats }, { data: players }] =
    await Promise.all([
      reportId
        ? supabase
            .from("goals")
            .select("id, side, scorer_jersey, assist_jersey, minute, own_goal")
            .eq("report_id", reportId)
            .order("minute")
        : { data: [] as never[] },
      reportId
        ? supabase
            .from("discipline")
            .select("id, side, jersey, card, minute")
            .eq("report_id", reportId)
            .order("minute")
        : { data: [] as never[] },
      reportId
        ? supabase.from("team_game_stats").select("*").eq("report_id", reportId).maybeSingle()
        : { data: null },
      event.teams
        ? supabase
            .from("players")
            .select("id, name, jersey")
            .eq("team_id", event.teams.id)
            .order("jersey")
        : { data: [] as never[] },
    ]);

  const playerStatsByPlayer = new Map<string, Record<string, unknown>>();
  if (reportId && event.teams?.is_varsity) {
    const { data: stats } = await supabase
      .from("player_game_stats")
      .select("*")
      .eq("report_id", reportId);
    (stats ?? []).forEach((s) => playerStatsByPlayer.set(s.player_id, s));
  }

  const isEmpty = (goals ?? []).length === 0;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{event.title}</h1>
        <p className="text-sm text-secondary-text">{event.date}</p>
      </div>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Scoring Summary</h2>
        <ul className="mb-3 flex flex-col gap-1 text-sm">
          {(goals ?? []).map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between rounded-md border border-card-border bg-card-bg px-3 py-1.5"
            >
              <span>
                {g.side} — #{g.scorer_jersey ?? "?"}{" "}
                {g.own_goal && <em>(OG)</em>}
                {g.assist_jersey ? ` (assist #${g.assist_jersey})` : ""}
                {g.minute ? ` ${g.minute}'` : ""}
              </span>
              <form action={removeGoal}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="event_id" value={eventId} />
                <button className="text-secondary-text underline" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {isEmpty && (
            <li className="text-muted">No goals logged yet.</li>
          )}
        </ul>

        {isEmpty && (
          <form action={setNoGoals} className="mb-3 flex items-center gap-2 text-sm">
            <input type="hidden" name="event_id" value={eventId} />
            <input
              type="checkbox"
              name="no_goals"
              id="no_goals"
              defaultChecked={report?.no_goals ?? false}
            />
            <label htmlFor="no_goals">This game finished 0–0</label>
            <button type="submit" className="rounded-md border border-navy px-2 py-1 text-navy">
              Save
            </button>
          </form>
        )}

        <form action={addGoal} className="flex flex-wrap items-end gap-2 text-sm">
          <input type="hidden" name="event_id" value={eventId} />
          <label className="flex flex-col">
            Side
            <select name="side" className="rounded-md border border-card-border px-2 py-1">
              <option value="CHS">CHS</option>
              <option value="OPP">{event.opponents?.name ?? "Opponent"}</option>
            </select>
          </label>
          <label className="flex flex-col">
            Scorer #
            <input name="scorer_jersey" className="w-20 rounded-md border border-card-border px-2 py-1" />
          </label>
          <label className="flex flex-col">
            Assist #
            <input name="assist_jersey" className="w-20 rounded-md border border-card-border px-2 py-1" />
          </label>
          <label className="flex flex-col">
            Minute
            <input name="minute" className="w-20 rounded-md border border-card-border px-2 py-1" />
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="own_goal" /> OG
          </label>
          <button type="submit" className="rounded-md bg-navy px-3 py-1.5 text-white">
            Add goal
          </button>
        </form>

        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-secondary-text">
            Backfill a final score instead (no play-by-play available)
          </summary>
          <form action={setBackfillScore} className="mt-2 flex items-end gap-2">
            <input type="hidden" name="event_id" value={eventId} />
            <label className="flex flex-col">
              CHS
              <input name="final_chs" type="number" defaultValue={report?.final_chs ?? ""} className="w-20 rounded-md border border-card-border px-2 py-1" />
            </label>
            <label className="flex flex-col">
              Opp
              <input name="final_opp" type="number" defaultValue={report?.final_opp ?? ""} className="w-20 rounded-md border border-card-border px-2 py-1" />
            </label>
            <button type="submit" className="rounded-md border border-navy px-3 py-1.5 text-navy">
              Save final score
            </button>
          </form>
        </details>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Discipline</h2>
        <ul className="mb-3 flex flex-col gap-1 text-sm">
          {(discipline ?? []).map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-md border border-card-border bg-card-bg px-3 py-1.5"
            >
              <span>
                {d.card} — {d.side} #{d.jersey ?? "?"} {d.minute ? `${d.minute}'` : ""}
              </span>
              <form action={removeDiscipline}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="event_id" value={eventId} />
                <button className="text-secondary-text underline" type="submit">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {(discipline ?? []).length === 0 && (
            <li className="text-muted">No cards logged.</li>
          )}
        </ul>
        <form action={addDiscipline} className="flex flex-wrap items-end gap-2 text-sm">
          <input type="hidden" name="event_id" value={eventId} />
          <label className="flex flex-col">
            Side
            <select name="side" className="rounded-md border border-card-border px-2 py-1">
              <option value="CHS">CHS</option>
              <option value="OPP">{event.opponents?.name ?? "Opponent"}</option>
            </select>
          </label>
          <label className="flex flex-col">
            Jersey #
            <input name="jersey" className="w-20 rounded-md border border-card-border px-2 py-1" />
          </label>
          <label className="flex flex-col">
            Card
            <select name="card" className="rounded-md border border-card-border px-2 py-1">
              <option>Yellow</option>
              <option>Red</option>
            </select>
          </label>
          <label className="flex flex-col">
            Minute
            <input name="minute" className="w-20 rounded-md border border-card-border px-2 py-1" />
          </label>
          <button type="submit" className="rounded-md bg-navy px-3 py-1.5 text-white">
            Add card
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Team Stats</h2>
        <form action={saveTeamStats} className="flex flex-wrap items-end gap-2 text-sm">
          <input type="hidden" name="event_id" value={eventId} />
          {(["corners", "free_kicks", "fouls", "shots_conceded"] as const).map((f) => (
            <label key={f} className="flex flex-col">
              {f.replace("_", " ")}
              <input
                name={f}
                type="number"
                defaultValue={
                  (teamStats as Record<string, unknown> | null)?.[f] as number | undefined
                }
                className="w-24 rounded-md border border-card-border px-2 py-1"
              />
            </label>
          ))}
          <label className="flex flex-col">
            Possession %
            <input
              name="possession_pct"
              type="number"
              step="0.1"
              defaultValue={teamStats?.possession_pct ?? undefined}
              className="w-24 rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <button type="submit" className="rounded-md bg-navy px-3 py-1.5 text-white">
            Save team stats
          </button>
        </form>
      </section>

      {event.teams?.is_varsity && (
        <section>
          <h2 className="mb-2 font-semibold text-navy">Player Stats (Varsity)</h2>
          <form action={savePlayerStats} className="flex flex-col gap-2">
            <input type="hidden" name="event_id" value={eventId} />
            <div className="overflow-x-auto rounded-lg border border-card-border bg-card-bg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-navy text-left text-white">
                    <th className="px-2 py-1">#</th>
                    <th className="px-2 py-1">Player</th>
                    <th className="px-2 py-1">H1</th>
                    <th className="px-2 py-1">H2</th>
                    <th className="px-2 py-1">SOn</th>
                    <th className="px-2 py-1">SOff</th>
                    <th className="px-2 py-1">Clr</th>
                    <th className="px-2 py-1">Int</th>
                    <th className="px-2 py-1">Tkl</th>
                    <th className="px-2 py-1">PassC</th>
                    <th className="px-2 py-1">PassM</th>
                    <th className="px-2 py-1">Sv</th>
                  </tr>
                </thead>
                <tbody>
                  {(players ?? []).map((p) => {
                    const s = playerStatsByPlayer.get(p.id) as
                      | Record<string, unknown>
                      | undefined;
                    return (
                      <tr key={p.id} className="border-t border-divider">
                        <td className="px-2 py-1">{p.jersey ?? "—"}</td>
                        <td className="px-2 py-1">
                          {p.name}
                          <input type="hidden" name="player_id" value={p.id} />
                        </td>
                        <td className="px-1 py-1">
                          <input type="checkbox" name={`half1_${p.id}`} defaultChecked={Boolean(s?.half1)} />
                        </td>
                        <td className="px-1 py-1">
                          <input type="checkbox" name={`half2_${p.id}`} defaultChecked={Boolean(s?.half2)} />
                        </td>
                        {(["shots_on", "shots_off", "clearances", "interceptions", "tackles_won", "passes_completed", "passes_missed", "saves"] as const).map((f) => (
                          <td key={f} className="px-1 py-1">
                            <input
                              type="number"
                              name={`${f}_${p.id}`}
                              defaultValue={(s?.[f] as number | undefined) ?? 0}
                              className="w-14 rounded border border-card-border px-1"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="submit" className="w-fit rounded-md bg-navy px-3 py-1.5 text-sm text-white">
              Save player stats
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
