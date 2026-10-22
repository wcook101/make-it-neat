import type { Metadata } from "next";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Make It Neat and its AI-assisted music production.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">About</h1>
      <div className="mt-6 space-y-5 text-lg leading-8 text-[#e7dccb]">
        <p>
          {site.artist} is a music project built around the idea that every song tells a story. The releases range into comedy, including political satire that is performed as fiction.
        </p>
        <p>
          Production is AI-assisted. AI tools may help draft, arrange, or shape a recording. The songs published under {site.artist} are the finished pieces presented on this site and on the YouTube channel.
        </p>
        <p>
          Satire on this site is labeled. A comedy song is not a news report, and the site does not treat fictional lyrics as factual allegations.
        </p>
        <p>
          <a href={site.youtubeChannel} className="text-[#e8c37a] underline underline-offset-4">
            Watch Make It Neat on YouTube
          </a>
        </p>
      </div>
    </div>
  );
}
