import { requireCoach } from "@/lib/auth/guards";
import { addStaffRole, createStaff } from "./actions";

export default async function StaffPage() {
  const supabase = await requireCoach();

  const [{ data: staff }, { data: teams }] = await Promise.all([
    supabase
      .from("staff")
      .select(
        "id, first_name, last_name, email, staff_roles(id, role_type, position, teams(name))"
      )
      .order("last_name"),
    supabase.from("teams").select("id, name").is("archived_at", null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-navy">Staff</h1>

      <ul className="flex flex-col gap-3">
        {(staff ?? []).map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-card-border bg-card-bg p-3"
          >
            <p className="font-medium">
              {s.first_name} {s.last_name}{" "}
              {s.email && (
                <span className="text-sm text-secondary-text">{s.email}</span>
              )}
            </p>
            <ul className="mt-1 text-sm text-secondary-text">
              {(s.staff_roles ?? []).map((r) => (
                <li key={r.id}>
                  {r.position}
                  {r.teams ? ` — ${r.teams.name}` : " (admin)"}
                </li>
              ))}
            </ul>
            <form action={addStaffRole} className="mt-2 flex items-end gap-2">
              <input type="hidden" name="staff_id" value={s.id} />
              <label className="flex flex-col text-xs">
                Position
                <input
                  name="position"
                  required
                  className="rounded-md border border-card-border px-2 py-1"
                />
              </label>
              <label className="flex flex-col text-xs">
                Team (blank = admin)
                <select
                  name="team_id"
                  className="rounded-md border border-card-border px-2 py-1"
                >
                  <option value="">—</option>
                  {(teams ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-md border border-navy px-2 py-1 text-xs text-navy"
              >
                Add role
              </button>
            </form>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="mb-2 font-semibold text-navy">Add Staff</h2>
        <form action={createStaff} className="grid max-w-lg grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">
            First name
            <input
              name="first_name"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Last name
            <input
              name="last_name"
              required
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Email (optional)
            <input
              name="email"
              type="email"
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
          <label className="flex flex-col text-sm">
            Position
            <input
              name="position"
              required
              placeholder="Head Coach, Athletic Director, ..."
              className="rounded-md border border-card-border px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            Team (blank = school admin)
            <select
              name="team_id"
              className="rounded-md border border-card-border px-2 py-1"
            >
              <option value="">—</option>
              {(teams ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="col-span-2 rounded-md bg-navy px-3 py-1.5 text-sm text-white"
          >
            Add staff member
          </button>
        </form>
      </section>
    </div>
  );
}
