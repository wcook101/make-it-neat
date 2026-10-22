import { isDirectMp3 } from "@/lib/audio";

export function AudioPlayer({ title, src }: { title: string; src?: string }) {
  if (!isDirectMp3(src)) {
    return (
      <p className="rounded-md border border-dashed border-white/20 bg-black/30 px-4 py-3 text-sm text-[#d9cbb8]" role="status">
        No MP3 is attached to {title}. Playback stays off until a direct public HTTPS link to an .mp3 file is added.
      </p>
    );
  }

  return (
    <div>
      <audio className="w-full" controls preload="none" src={src}>
        <a href={src}>Download {title}</a>
      </audio>
      <p className="mt-2 text-xs text-[#b7aa9a]">Direct MP3 link</p>
    </div>
  );
}
