import { createClient } from "@/lib/supabase/server";

// Full CRUD + pinning is Phase 3; Phase 1 just proves the public read path.
export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("v_public_announcements")
    .select("*")
    .order("posted_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy">Announcements</h1>
      <ul className="flex flex-col gap-3">
        {(announcements ?? []).length === 0 && (
          <li className="text-sm text-muted">No announcements yet.</li>
        )}
        {(announcements ?? []).map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-card-border bg-card-bg p-4"
          >
            <p className="font-medium">{a.title}</p>
            {a.team_name && (
              <p className="text-xs text-tan">{a.team_name}</p>
            )}
            <p className="mt-1 text-sm text-secondary-text">{a.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
