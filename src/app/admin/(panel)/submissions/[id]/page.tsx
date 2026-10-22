import { notFound } from "next/navigation";

import { AdminError, SubmissionForm } from "@/components/admin/forms";
import { listOutlets, listSongs, submissionById } from "@/server/admin/records";
import { getDb } from "@/server/db/index";

export const metadata = { title: "Edit submission" };

export default async function EditSubmissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const db = await getDb();
  const [submission, songs, outlets] = await Promise.all([submissionById(db, id), listSongs(db), listOutlets(db)]);
  if (!submission) notFound();
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">{submission.song_title}</h1>
      <p className="mt-2 text-[#b7aa9a]">{submission.outlet_name}</p>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <SubmissionForm action={`/api/admin/submissions/${submission.id}`} songs={songs} outlets={outlets} submission={submission} />
      </div>
    </div>
  );
}
