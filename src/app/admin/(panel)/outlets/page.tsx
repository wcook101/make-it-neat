import Link from "next/link";

import { listOutlets } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Outlets" };

export default async function OutletsPage() {
  const outlets = await listOutlets(await getDb());
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Outlets</h1>
        <Link href="/admin/outlets/new" className="rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]">Add outlet</Link>
      </div>
      <ul className="mt-6 space-y-2">
        {outlets.map((outlet) => (
          <li key={outlet.id}>
            <Link href={`/admin/outlets/${outlet.id}`} className="text-white">{outlet.name}</Link>
            {outlet.contact_email ? <span className="ml-2 text-sm text-[#b7aa9a]">{outlet.contact_email}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
