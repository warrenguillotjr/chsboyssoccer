import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: schedule }, { data: announcements }, { data: staff }] =
    await Promise.all([
      supabase
        .from("v_public_schedule")
        .select("*")
        .order("date", { ascending: true })
        .limit(5),
      supabase
        .from("v_public_announcements")
        .select("*")
        .order("posted_at", { ascending: false })
        .limit(5),
      supabase.from("v_public_staff_directory").select("*"),
    ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">
          CHS Boys Soccer Program Hub
        </h1>
        <Link
          href="/sign-in"
          className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-navy">
          Upcoming Schedule
        </h2>
        <div className="overflow-x-auto rounded-lg border border-card-border bg-card-bg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-left text-white">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Opponent</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(schedule ?? []).length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-muted" colSpan={5}>
                    No upcoming events yet.
                  </td>
                </tr>
              )}
              {(schedule ?? []).map((e) => (
                <tr key={e.id} className="border-t border-divider">
                  <td className="px-3 py-2">{e.date}</td>
                  <td className="px-3 py-2">{e.team_name ?? "All"}</td>
                  <td className="px-3 py-2">{e.opponent_name ?? "—"}</td>
                  <td className="px-3 py-2">{e.location ?? "—"}</td>
                  <td className="px-3 py-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/schedule"
          className="mt-2 inline-block text-sm text-navy underline underline-offset-2"
        >
          View full schedule
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-navy">
          Announcements
        </h2>
        <ul className="flex flex-col gap-3">
          {(announcements ?? []).length === 0 && (
            <li className="text-sm text-muted">No announcements yet.</li>
          )}
          {(announcements ?? []).map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-card-border bg-card-bg p-3"
            >
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-secondary-text">{a.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-navy">Staff</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(staff ?? []).map((s) => (
            <li
              key={`${s.id}-${s.position}`}
              className="rounded-lg border border-card-border bg-card-bg p-3 text-sm"
            >
              <span className="font-medium">
                {s.first_name} {s.last_name}
              </span>
              <span className="text-secondary-text">
                {" "}
                — {s.position}
                {s.team_name ? ` (${s.team_name})` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
