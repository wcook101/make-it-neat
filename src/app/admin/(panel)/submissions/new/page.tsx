import { AdminError, SubmissionForm } from "@/components/admin/forms";
import { listOutlets, listSongs } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Add submission" };

export default async function NewSubmissionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const db = await getDb();
  const [songs, outlets] = await Promise.all([listSongs(db), listOutlets(db)]);
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Add submission</h1>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <SubmissionForm action="/api/admin/submissions" songs={songs} outlets={outlets} />
      </div>
    </div>
  );
}
