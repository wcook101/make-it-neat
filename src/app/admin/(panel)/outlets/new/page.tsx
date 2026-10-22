import { AdminError, OutletForm } from "@/components/admin/forms";

export const metadata = { title: "Add outlet" };

export default async function NewOutletPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Add outlet</h1>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <OutletForm action="/api/admin/outlets" />
      </div>
    </div>
  );
}
