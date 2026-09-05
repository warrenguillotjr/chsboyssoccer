import { requireCoach } from "@/lib/auth/guards";
import {
  archiveOpponent,
  archiveTeam,
  createOpponent,
  createTeam,
} from "./actions";

export default async function TeamsPage() {
  const supabase = await requireCoach();

  const [{ data: teams }, { data: opponents }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, is_varsity, archived_at")
      .is("archived_at", null)
      .order("is_varsity", { ascending: false })
      .order("name"),
    supabase
      .from("opponents")
      .select("id, name, archived_at")
      .is("archived_at", null)
      .order("name"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Teams</h1>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Teams</h2>
        <ul className="mb-3 flex flex-col gap-2">
          {(teams ?? []).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-card-border bg-card-bg px-3 py-2 text-sm"
            >
              <span>
                {t.name} {t.is_varsity && <em className="text-tan">(Varsity)</em>}
              </span>
              <form action={archiveTeam}>
                <input type="hidden" name="id" value={t.id} />
                <button className="text-secondary-text underline" type="submit">
                  Archive
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createTeam} className="flex items-end gap-3">
          <label className="flex flex-col text-sm">
            Name
            <input
              name="name"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="is_varsity" />
            Varsity
          </label>
          <button
            type="submit"
            className="rounded-md bg-navy px-3 py-1.5 text-sm text-white"
          >
            Add team
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Opponents</h2>
        <ul className="mb-3 flex flex-col gap-2">
          {(opponents ?? []).map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between rounded-md border border-card-border bg-card-bg px-3 py-2 text-sm"
            >
              <span>{o.name}</span>
              <form action={archiveOpponent}>
                <input type="hidden" name="id" value={o.id} />
                <button className="text-secondary-text underline" type="submit">
                  Archive
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createOpponent} className="flex items-end gap-3">
          <label className="flex flex-col text-sm">
            Name
            <input
              name="name"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-navy px-3 py-1.5 text-sm text-white"
          >
            Add opponent
          </button>
        </form>
      </section>
    </div>
  );
}
