"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/content/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Item({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`block rounded-full px-3 py-2 text-sm ${current ? "bg-white/10 text-white" : "text-[#e7dccb]"}`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const current = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="min-w-0">
          <span className="block font-[family-name:var(--font-display)] text-xl tracking-wide text-white">
            {site.artist}
          </span>
          <span className="block truncate text-xs uppercase tracking-[0.18em] text-[#d6b16a]">
            {site.tagline}
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-1 md:flex">
          {LINKS.map((link) => (
            <Item key={link.href} {...link} current={current(link.href)} />
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-full border border-white/15 px-3 py-2 text-sm text-white">
            Menu
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/10 bg-[#120e0b] p-2 shadow-xl">
            {LINKS.map((link) => (
              <Item key={link.href} {...link} current={current(link.href)} />
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
