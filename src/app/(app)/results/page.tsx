import Link from "next/link";
import { requireSession } from "@/lib/auth/guards";
import { getCurrentRole } from "@/lib/auth/session";

export default async function ResultsPage() {
  const supabase = await requireSession();
  const role = await getCurrentRole(supabase);

  const { data: openSeason } = await supabase
    .from("seasons")
    .select("id, label")
    .eq("closed", false)
    .maybeSingle();

  const { data: games } = openSeason
    ? await supabase
        .from("events")
        .select(
          "id, date, game_num, home_away, teams(name), opponents(name), game_reports(id)"
        )
        .eq("season_id", openSeason.id)
        .eq("type", "Game")
        .order("date", { ascending: true })
    : { data: null };

  const rows = await Promise.all(
    (games ?? []).map(async (g) => {
      const reportId = g.game_reports?.id;
      if (!reportId) return { ...g, result: null };
      const { data } = await supabase
        .rpc("game_result", { p_report_id: reportId })
        .maybeSingle();
      return { ...g, result: data };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Results</h1>
      <p className="text-sm text-secondary-text">
        Season: {openSeason?.label ?? "No open season yet"}
      </p>
      <div className="overflow-x-auto rounded-lg border border-card-border bg-card-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-left text-white">
              <th className="px-3 py-2">Game #</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Opponent</th>
              <th className="px-3 py-2">H/A</th>
              <th className="px-3 py-2">CHS</th>
              <th className="px-3 py-2">Opp</th>
              {role === "coach" && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-muted" colSpan={8}>
                  No games scheduled yet.
                </td>
              </tr>
            )}
            {rows.map((g) => (
              <tr key={g.id} className="border-t border-divider">
                <td className="px-3 py-2">{g.game_num ?? "—"}</td>
                <td className="px-3 py-2">{g.date}</td>
                <td className="px-3 py-2">{g.teams?.name ?? "All"}</td>
                <td className="px-3 py-2">{g.opponents?.name ?? "—"}</td>
                <td className="px-3 py-2">{g.home_away ?? "—"}</td>
                <td className="px-3 py-2">
                  {g.result?.played ? g.result.chs_score : "—"}
                </td>
                <td className="px-3 py-2">
                  {g.result?.played ? g.result.opp_score : "—"}
                </td>
                {role === "coach" && (
                  <td className="px-3 py-2">
                    <Link
                      href={`/results/${g.id}`}
                      className="text-navy underline"
                    >
                      Update Result
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
