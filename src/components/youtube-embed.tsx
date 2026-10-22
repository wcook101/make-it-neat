export function YoutubeEmbed({ youtubeId, title }: { youtubeId?: string; title: string }) {
  if (!youtubeId) {
    return (
      <p className="rounded-md border border-dashed border-white/20 px-4 py-6 text-sm text-[#d9cbb8]" role="status">
        No YouTube video is attached to {title}.
      </p>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={`${title} video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
