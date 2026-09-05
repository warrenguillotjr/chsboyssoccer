import Link from "next/link";
import { requireSession } from "@/lib/auth/guards";
import { getCurrentRole } from "@/lib/auth/session";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/schedule", label: "Schedule" },
  { href: "/results", label: "Results" },
  { href: "/roster", label: "Roster", coachOnly: true },
  { href: "/staff", label: "Staff", coachOnly: true },
  { href: "/teams", label: "Teams", coachOnly: true },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await requireSession();
  const role = await getCurrentRole(supabase);

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-divider bg-navy p-4 text-white">
        <p className="mb-4 font-heading text-lg font-semibold">
          CHS Boys Soccer
        </p>
        {NAV.filter((item) => !item.coachOnly || role === "coach").map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-white/10"
            >
              {item.label}
            </Link>
          )
        )}
        <form action="/api/auth/sign-out" method="post" className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
