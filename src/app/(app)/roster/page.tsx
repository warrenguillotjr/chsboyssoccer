import { requireCoach } from "@/lib/auth/guards";
import { createPlayer } from "./actions";

export default async function RosterPage() {
  const supabase = await requireCoach();

  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase
      .from("players")
      .select("id, name, jersey, positions, grade_level, captain, teams(name)")
      .order("team_id")
      .order("jersey"),
    supabase.from("teams").select("id, name").is("archived_at", null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Roster</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(players ?? []).map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-card-border bg-card-bg p-3 text-sm"
          >
            <p className="font-medium">
              #{p.jersey ?? "—"} {p.name} {p.captain && <span className="text-tan">(C)</span>}
            </p>
            <p className="text-secondary-text">
              {p.teams?.name} · Grade {p.grade_level ?? "—"} ·{" "}
              {(p.positions ?? []).join(", ") || "—"}
            </p>
          </div>
        ))}
        {(players ?? []).length === 0 && (
          <p className="text-sm text-muted">No players yet.</p>
        )}
      </div>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Add Player</h2>
        <form
          action={createPlayer}
          className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3"
        >
          <label className="flex flex-col text-sm">
            Name
            <input
              name="name"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Team
            <select
              name="team_id"
              required
              className="rounded-md border border-card-border px-2 py-1"
            >
              {(teams ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Jersey #
            <input
              name="jersey"
              type="number"
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Positions (comma-sep)
            <input
              name="positions"
              placeholder="D, M"
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Grade (9-12)
            <input
              name="grade_level"
              type="number"
              min={9}
              max={12}
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Grad year
            <input
              name="grad_year"
              type="number"
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            PIN (4 digits)
            <input
              name="pin"
              required
              pattern="\d{4}"
              maxLength={4}
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="captain" />
            Captain
          </label>
          <button
            type="submit"
            className="col-span-2 rounded-md bg-navy px-3 py-1.5 text-sm text-white sm:col-span-3"
          >
            Add player
          </button>
        </form>
      </section>
    </div>
  );
}
