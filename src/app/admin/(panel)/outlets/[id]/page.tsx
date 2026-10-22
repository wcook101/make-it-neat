import { notFound } from "next/navigation";

import { AdminError, OutletForm } from "@/components/admin/forms";
import { outletById } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Edit outlet" };

export default async function EditOutletPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const outlet = await outletById(await getDb(), id);
  if (!outlet) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">{outlet.name}</h1>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <OutletForm action={`/api/admin/outlets/${outlet.id}`} outlet={outlet} />
      </div>
    </div>
  );
}
