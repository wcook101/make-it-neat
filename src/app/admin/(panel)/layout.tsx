import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/server/admin/constants";
import { verifySessionToken } from "@/server/admin/session";
import { getDb } from "@/server/db/index";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/songs", "Songs"],
  ["/admin/submissions", "Submissions"],
  ["/admin/outlets", "Outlets"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(SESSION_COOKIE)?.value, process.env.ADMIN_SESSION_SECRET);
  if (!session) redirect("/admin/login");
  let databaseReady = true;
  try {
    await getDb();
  } catch {
    databaseReady = false;
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2" aria-label="Admin">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white">
              {label}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="post">
          <input type="hidden" name="redirect" value="1" />
          <button className="text-sm text-[#e8c37a]" type="submit">Sign out</button>
        </form>
      </div>
      {databaseReady ? null : (
        <p className="mt-4 rounded-md border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
          The catalog database is unavailable.
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
