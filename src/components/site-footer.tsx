import Link from "next/link";

import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[#b7aa9a] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.artist}</p>
        <p>
          <Link href="/music" className="underline decoration-white/30 underline-offset-4">
            Music catalog
          </Link>
          {" · "}
          <a href={site.youtubeChannel} className="underline decoration-white/30 underline-offset-4">
            YouTube
          </a>
        </p>
      </div>
    </footer>
  );
}
