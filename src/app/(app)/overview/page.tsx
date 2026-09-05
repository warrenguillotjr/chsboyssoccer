import { requireSession } from "@/lib/auth/guards";

// Full Team Snapshot / Season Comparison land in Phase 2. Phase 1 only
// needs enough of Overview to prove sign-in and season data flow end to end.
export default async function OverviewPage() {
  const supabase = await requireSession();

  const { data: openSeason } = await supabase
    .from("seasons")
    .select("id, label")
    .eq("closed", false)
    .maybeSingle();

  const { data: nextUp } = openSeason
    ? await supabase
        .from("events")
        .select("id, type, title, date, start_time, status")
        .eq("season_id", openSeason.id)
        .neq("status", "Cancelled")
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-navy">Overview</h1>
      <p className="text-sm text-secondary-text">
        Season: {openSeason?.label ?? "No open season yet"}
      </p>
      <section className="rounded-lg border border-card-border bg-card-bg p-4">
        <h2 className="mb-2 font-semibold text-navy">Next Up</h2>
        {nextUp ? (
          <p className="text-sm">
            {nextUp.type} — {nextUp.title} on {nextUp.date}
            {nextUp.start_time ? ` at ${nextUp.start_time}` : ""} (
            {nextUp.status})
          </p>
        ) : (
          <p className="text-sm text-muted">Nothing scheduled yet.</p>
        )}
      </section>
    </div>
  );
}
