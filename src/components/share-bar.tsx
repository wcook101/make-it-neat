"use client";

import { useState } from "react";

export function ShareBar({ title, path }: { title: string; path: string }) {
  const [notice, setNotice] = useState("");

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setNotice("Link copied.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-[#e8c37a]/50 px-4 py-2 text-sm text-[#f6e7c4]"
      >
        Share this song
      </button>
      {notice ? <p className="text-sm text-[#d9cbb8]">{notice}</p> : null}
    </div>
  );
}
