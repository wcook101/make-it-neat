import { AdminError, SongForm } from "@/components/admin/forms";

export const metadata = { title: "Add song" };

export default async function NewSongPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Add song</h1>
      <p className="mt-3 text-sm text-[#b7aa9a]">Save the song first. Audio and cover files are uploaded on the next screen.</p>
      <div className="mt-6 grid gap-4">
        <AdminError code={query.error} />
        <SongForm action="/api/admin/songs" />
      </div>
    </div>
  );
}
