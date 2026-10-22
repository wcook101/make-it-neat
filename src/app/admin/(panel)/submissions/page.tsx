import Link from "next/link";

import { STATUS_LABELS, SUBMISSION_STATUSES, type SubmissionStatus } from "@/server/admin/constants";
import { listOutlets, listSubmissions } from "@/server/admin/records";
import { addDays, todayIso } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Submissions" };

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const today = todayIso();
  const db = await getDb();
  const [submissions, outlets] = await Promise.all([
    listSubmissions(db, {
      search: query.q,
      status: query.status,
      outletId: query.outlet,
      due: query.due,
      sort: query.sort ?? "updated_at",
      dir: query.dir ?? "desc",
      today,
      until: addDays(today, 14),
    }),
    listOutlets(db),
  ]);
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) exportQuery.set(key, value);
  }
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Submissions</h1>
        <div className="flex gap-3">
          <a className="rounded-full border border-white/20 px-4 py-2 text-sm text-white" href={`/api/admin/submissions/export?${exportQuery.toString()}`}>
            Export CSV
          </a>
          <Link href="/admin/submissions/new" className="rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]">Add submission</Link>
        </div>
      </div>
      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" method="get">
        <input className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="q" defaultValue={query.q ?? ""} placeholder="Search" />
        <select className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="status" defaultValue={query.status ?? "all"}>
          <option value="all">All statuses</option>
          {SUBMISSION_STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
        <select className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="outlet" defaultValue={query.outlet ?? ""}>
          <option value="">All outlets</option>
          {outlets.map((outlet) => (
            <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
          ))}
        </select>
        <select className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="due" defaultValue={query.due ?? ""}>
          <option value="">Any follow-up</option>
          <option value="overdue">Overdue</option>
          <option value="upcoming">Due in 14 days</option>
        </select>
        <select className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="sort" defaultValue={query.sort ?? "updated_at"}>
          <option value="updated_at">Updated</option>
          <option value="date_submitted">Date submitted</option>
          <option value="follow_up_date">Follow-up date</option>
          <option value="status">Status</option>
          <option value="song">Song</option>
          <option value="outlet">Outlet</option>
        </select>
        <select className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="dir" defaultValue={query.dir ?? "desc"}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm text-white" type="submit">Apply</button>
      </form>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[#b7aa9a]">
            <tr>
              <th className="py-2">Song</th>
              <th>Outlet</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="py-3">
                  <Link href={`/admin/submissions/${item.id}`} className="text-white">{item.song_title}</Link>
                </td>
                <td>{item.outlet_name}</td>
                <td>{STATUS_LABELS[item.status as SubmissionStatus]}</td>
                <td>{item.date_submitted ?? "Unknown"}</td>
                <td>
                  {item.follow_up_date ?? "—"}
                  {item.follow_up_date && item.follow_up_date < today ? <span className="ml-2 text-[#e8c37a]">Overdue</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 ? <p className="mt-4 text-[#b7aa9a]">No submissions match these filters.</p> : null}
      </div>
    </div>
  );
}
