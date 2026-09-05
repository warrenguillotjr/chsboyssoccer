import { notFound } from "next/navigation";
import { requireCoach } from "@/lib/auth/guards";
import { updateEvent } from "../actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await requireCoach();

  const { data: event } = await supabase
    .from("events")
    .select("id, date, start_time, location, status, title, type")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-xl font-semibold text-navy">{event.title}</h1>
      <form action={updateEvent} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={event.id} />
        <label className="flex flex-col text-sm">
          Date
          <input
            type="date"
            name="date"
            defaultValue={event.date}
            required
            className="rounded-md border border-card-border px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Start time
          <input
            type="time"
            name="start_time"
            defaultValue={event.start_time ?? ""}
            className="rounded-md border border-card-border px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Location
          <input
            name="location"
            defaultValue={event.location ?? ""}
            className="rounded-md border border-card-border px-2 py-1"
          />
        </label>
        <label className="flex flex-col text-sm">
          Status
          <select
            name="status"
            defaultValue={event.status}
            className="rounded-md border border-card-border px-2 py-1"
          >
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Postponed</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-navy px-3 py-1.5 text-sm text-white"
        >
          Save
        </button>
      </form>
    </main>
  );
}
