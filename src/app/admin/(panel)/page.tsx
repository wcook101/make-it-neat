import Link from "next/link";

import { BarChart } from "@/components/admin/chart";
import { STATUS_LABELS, SUBMISSION_STATUSES, type SubmissionStatus } from "@/server/admin/constants";
import { dashboardStats } from "@/server/admin/records";
import { addDays, todayIso } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Admin dashboard" };

export default async function DashboardPage() {
  const today = todayIso();
  const stats = await dashboardStats(await getDb(), today, addDays(today, 14));
  const statusRows = SUBMISSION_STATUSES.map((status) => ({
    label: STATUS_LABELS[status],
    count: stats.byStatus.find((row) => row.label === status)?.count ?? 0,
  }));
  const cards = [
    ["Songs", stats.songs],
    ["Published", stats.publishedSongs],
    ["Submissions", stats.submissions],
    ["Accepted", stats.accepted],
    ["Pending responses", stats.pending],
  ];
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Dashboard</h1>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#14110e] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-[#b7aa9a]">{label}</dt>
            <dd className="mt-2 font-[family-name:var(--font-display)] text-4xl text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BarChart title="By status" rows={statusRows} />
        <BarChart title="By outlet" rows={stats.byOutlet} />
      </div>
      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">Follow-ups</h2>
        {stats.followUps.length === 0 ? (
          <p className="mt-3 text-[#b7aa9a]">No follow-ups are due in the next 14 days.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.followUps.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/submissions/${item.id}`} className="text-[#e8c37a]">
                  {item.follow_up_date} · {item.song_title} · {item.outlet_name}
                </Link>
                <span className="ml-2 text-sm text-[#b7aa9a]">{item.overdue ? "Overdue" : "Due"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">Recent submissions</h2>
        {stats.recent.length === 0 ? (
          <p className="mt-3 text-[#b7aa9a]">No submissions have been recorded.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.recent.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/submissions/${item.id}`} className="text-white">
                  {item.song_title} · {item.outlet_name}
                </Link>
                <span className="ml-2 text-sm text-[#b7aa9a]">{STATUS_LABELS[item.status as SubmissionStatus]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
