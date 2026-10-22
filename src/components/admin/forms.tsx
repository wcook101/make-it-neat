import { STATUS_LABELS, SONG_STATUSES, SUBMISSION_STATUSES } from "@/server/admin/constants";
import type { OutletRecord, SongRecord, SubmissionRecord } from "@/server/admin/records";

const fieldClass = "grid gap-1 text-sm text-[#d9cbb8]";
const inputClass = "rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white";

export function AdminError({ code }: { code?: string }) {
  const messages: Record<string, string> = {
    invalid: "Check the fields and try again.",
    unauthorized: "Sign-in failed.",
    rate: "Too many sign-in attempts. Wait 15 minutes and try again.",
    duplicate: "That name or slug is already used.",
    config: "File storage is not configured, so the upload was not saved.",
  };
  if (!code || !messages[code]) return null;
  return <p className="rounded-md border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">{messages[code]}</p>;
}

function TextField({ label, name, defaultValue, required = false, type = "text" }: { label: string; name: string; defaultValue?: string | null; required?: boolean; type?: string }) {
  return (
    <label className={fieldClass}>
      {label}
      <input className={inputClass} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </label>
  );
}

export function SongForm({ action, song }: { action: string; song?: SongRecord }) {
  return (
    <form action={action} method="post" className="grid gap-4">
      <input type="hidden" name="redirect" value="1" />
      <TextField label="Title" name="title" defaultValue={song?.title} required />
      <TextField label="Slug" name="slug" defaultValue={song?.slug} />
      <label className={fieldClass}>
        Description
        <textarea className={inputClass} name="description" rows={4} required defaultValue={song?.description ?? ""} />
      </label>
      <TextField label="Genre" name="genre" defaultValue={song?.genre} required />
      <label className={fieldClass}>
        Lyrics
        <textarea className={inputClass} name="lyrics" rows={8} defaultValue={song?.lyrics ?? ""} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Duration" name="duration" defaultValue={song?.duration} />
        <TextField label="Release date" name="releaseDate" type="date" defaultValue={song?.release_date} />
      </div>
      <TextField label="YouTube URL" name="youtubeUrl" defaultValue={song?.youtube_url} />
      <TextField label="Spotify URL" name="spotifyUrl" defaultValue={song?.spotify_url} />
      <TextField label="Apple Music URL" name="appleMusicUrl" defaultValue={song?.apple_music_url} />
      <TextField label="Artwork URL" name="artworkUrl" defaultValue={song?.artwork_url} />
      <TextField label="Artwork note" name="artworkNote" defaultValue={song?.artwork_note} />
      <TextField label="MP3 URL" name="mp3Url" defaultValue={song?.mp3_url} />
      <label className={fieldClass}>
        Publication status
        <select className={inputClass} name="status" defaultValue={song?.status ?? "draft"}>
          {SONG_STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-[#d9cbb8]">
        <input name="featured" type="checkbox" defaultChecked={song?.featured ?? false} />
        Featured on the homepage
      </label>
      <label className={fieldClass}>
        Satire disclaimer
        <textarea className={inputClass} name="satireDisclaimer" rows={3} defaultValue={song?.satire_disclaimer ?? ""} />
      </label>
      <button className="w-fit rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]" type="submit">
        Save song
      </button>
    </form>
  );
}

export function OutletForm({ action, outlet }: { action: string; outlet?: OutletRecord }) {
  return (
    <form action={action} method="post" className="grid gap-4">
      <input type="hidden" name="redirect" value="1" />
      <TextField label="Name" name="name" defaultValue={outlet?.name} required />
      <TextField label="Website" name="website" defaultValue={outlet?.website} />
      <TextField label="Contact name" name="contactName" defaultValue={outlet?.contact_name} />
      <TextField label="Contact email" name="contactEmail" type="email" defaultValue={outlet?.contact_email} />
      <label className={fieldClass}>
        Notes
        <textarea className={inputClass} name="notes" rows={4} defaultValue={outlet?.notes ?? ""} />
      </label>
      <button className="w-fit rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]" type="submit">
        Save outlet
      </button>
    </form>
  );
}

export function SubmissionForm({
  action,
  songs,
  outlets,
  submission,
}: {
  action: string;
  songs: SongRecord[];
  outlets: OutletRecord[];
  submission?: SubmissionRecord;
}) {
  return (
    <form action={action} method="post" className="grid gap-4">
      <input type="hidden" name="redirect" value="1" />
      <label className={fieldClass}>
        Song
        <select className={inputClass} name="songId" defaultValue={submission?.song_id ?? ""} required>
          <option value="">Choose a song</option>
          {songs.map((song) => (
            <option key={song.id} value={song.id}>{song.title}</option>
          ))}
        </select>
      </label>
      <label className={fieldClass}>
        Outlet
        <select className={inputClass} name="outletId" defaultValue={submission?.outlet_id ?? ""} required>
          <option value="">Choose an outlet</option>
          {outlets.map((outlet) => (
            <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
          ))}
        </select>
      </label>
      <TextField label="Contact name" name="contactName" defaultValue={submission?.contact_name} />
      <TextField label="Contact email" name="contactEmail" type="email" defaultValue={submission?.contact_email} />
      <TextField label="Submission URL" name="submissionUrl" defaultValue={submission?.submission_url} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Date submitted" name="dateSubmitted" type="date" defaultValue={submission?.date_submitted} />
        <TextField label="Follow-up date" name="followUpDate" type="date" defaultValue={submission?.follow_up_date} />
      </div>
      <label className={fieldClass}>
        Status
        <select className={inputClass} name="status" defaultValue={submission?.status ?? "researching"}>
          {SUBMISSION_STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </label>
      <label className={fieldClass}>
        Notes
        <textarea className={inputClass} name="notes" rows={4} defaultValue={submission?.notes ?? ""} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Response date" name="responseDate" type="date" defaultValue={submission?.response_date} />
        <TextField label="Published URL" name="publishedUrl" defaultValue={submission?.published_url} />
      </div>
      <label className={fieldClass}>
        Response details
        <textarea className={inputClass} name="responseDetails" rows={4} defaultValue={submission?.response_details ?? ""} />
      </label>
      <p className="text-sm text-[#b7aa9a]">Saving a submission only records it here. Nothing is emailed or submitted automatically.</p>
      <button className="w-fit rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]" type="submit">
        Save submission
      </button>
    </form>
  );
}
