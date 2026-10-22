import type { Metadata } from "next";

import { AdminError } from "@/components/admin/forms";
import { isAdminConfigured } from "@/server/admin/password";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const configured = isAdminConfigured();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Admin</h1>
      {configured ? (
        <form action="/api/admin/login" method="post" className="mt-8 grid gap-4">
          <input type="hidden" name="redirect" value="1" />
          <AdminError code={query.error} />
          <label className="grid gap-1 text-sm text-[#d9cbb8]">
            Email
            <input className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="email" type="email" autoComplete="username" required />
          </label>
          <label className="grid gap-1 text-sm text-[#d9cbb8]">
            Password
            <input className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white" name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="w-fit rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]" type="submit">
            Sign in
          </button>
        </form>
      ) : (
        <p className="mt-6 text-[#d9cbb8]">Admin sign-in is not configured on this server.</p>
      )}
    </div>
  );
}
