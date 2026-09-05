import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentRole } from "@/lib/auth/session";
import { createEvent, createSeason, deleteEvent } from "./actions";

export default async function SchedulePage() {
  const supabase = await createClient();
  const role = await getCurrentRole(supabase);
  const isCoach = role === "coach";

  if (!isCoach) {
    const { data: schedule } = await supabase
      .from("v_public_schedule")
      .select("*")
      .order("date", { ascending: true });
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-2xl font-semibold text-navy">Schedule</h1>
        <ScheduleTable
          rows={(schedule ?? []).map((e) => ({
            id: e.id!,
            date: e.date!,
            type: e.type!,
            teamName: e.team_name,
            opponentName: e.opponent_name,
            location: e.location,
            status: e.status!,
          }))}
        />
      </main>
    );
  }

  const [{ data: openSeason }, { data: events }, { data: teams }, { data: opponents }] =
    await Promise.all([
      supabase.from("seasons").select("id, label").eq("closed", false).maybeSingle(),
      supabase
        .from("events")
        .select("id, date, type, status, location, teams(name), opponents(name)")
        .order("date", { ascending: true }),
      supabase.from("teams").select("id, name").is("archived_at", null),
      supabase.from("opponents").select("id, name").is("archived_at", null),
    ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy">Schedule</h1>

      {!openSeason ? (
        <form action={createSeason} className="flex items-end gap-3">
          <label className="flex flex-col text-sm">
            No open season yet — start one (e.g. &quot;2026–2027&quot;)
            <input
              name="label"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-navy px-3 py-1.5 text-sm text-white"
          >
            Open season
          </button>
        </form>
      ) : (
        <>
          <p className="text-sm text-secondary-text">
            Season: <strong>{openSeason.label}</strong>
          </p>

          <ScheduleTable
            rows={(events ?? []).map((e) => ({
              id: e.id,
              date: e.date,
              type: e.type,
              teamName: e.teams?.name,
              opponentName: e.opponents?.name,
              location: e.location,
              status: e.status,
            }))}
            coachActions={(id) => (
              <div className="flex items-center gap-3">
                <Link href={`/schedule/${id}`} className="text-navy underline">
                  Edit
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={id} />
                  <button
                    className="text-secondary-text underline"
                    type="submit"
                  >
                    Delete
                  </button>
                </form>
              </div>
            )}
          />

          <section>
            <h2 className="mb-2 font-semibold text-navy">Add Event</h2>
            <form
              action={createEvent}
              className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
            >
              <input type="hidden" name="season_id" value={openSeason.id} />
              <label className="flex flex-col text-sm">
                Type
                <select
                  name="type"
                  required
                  className="rounded-md border border-card-border px-2 py-1"
                >
                  <option>Practice</option>
                  <option>Game</option>
                  <option>Scrimmage</option>
                  <option>Classroom Session</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Team (blank = All)
                <select
                  name="team_id"
                  className="rounded-md border border-card-border px-2 py-1"
                >
                  <option value="">All</option>
                  {(teams ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Date
                <input
                  type="date"
                  name="date"
                  required
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-sm">
                Start time
                <input
                  type="time"
                  name="start_time"
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-sm">
                Location
                <input
                  name="location"
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-sm">
                Opponent (games only)
                <select
                  name="opponent_id"
                  className="rounded-md border border-card-border px-2 py-1"
                >
                  <option value="">—</option>
                  {(opponents ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Home/Away
                <select
                  name="home_away"
                  className="rounded-md border border-card-border px-2 py-1"
                >
                  <option value="">—</option>
                  <option>Home</option>
                  <option>Away</option>
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Game #
                <input
                  name="game_num"
                  type="number"
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-sm">
                Event name (Other only)
                <input
                  name="event_name"
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="district" />
                District
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="playoff" />
                Playoff
              </label>
              <button
                type="submit"
                className="col-span-2 rounded-md bg-navy px-3 py-1.5 text-sm text-white sm:col-span-3"
              >
                Add event
              </button>
            </form>
          </section>
        </>
      )}

      <Link href="/overview" className="text-sm text-navy underline">
        Back to app
      </Link>
    </main>
  );
}

function ScheduleTable({
  rows,
  coachActions,
}: {
  rows: {
    id: string;
    date: string;
    type: string;
    teamName?: string | null;
    opponentName?: string | null;
    location?: string | null;
    status: string;
  }[];
  coachActions?: (id: string) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-card-border bg-card-bg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy text-left text-white">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">Opponent</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Status</th>
            {coachActions && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-muted" colSpan={coachActions ? 7 : 6}>
                No events yet.
              </td>
            </tr>
          )}
          {rows.map((e) => (
            <tr key={e.id} className="border-t border-divider">
              <td className="px-3 py-2">{e.date}</td>
              <td className="px-3 py-2">{e.type}</td>
              <td className="px-3 py-2">{e.teamName ?? "All"}</td>
              <td className="px-3 py-2">{e.opponentName ?? "—"}</td>
              <td className="px-3 py-2">{e.location ?? "—"}</td>
              <td className="px-3 py-2">{e.status}</td>
              {coachActions && (
                <td className="px-3 py-2">{coachActions(e.id)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
