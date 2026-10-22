"use client";

import { useState, type FormEvent } from "react";

import { site } from "@/content/site";

export function ContactForm() {
  const [notice, setNotice] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setNotice("Add your name, email, and message.");
      return;
    }
    if (!site.contactEmail) {
      setNotice("This form is not connected to an inbox. Add contactEmail in src/content/site.ts before messages can be sent.");
      return;
    }
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent("Make It Neat")}&body=${body}`;
    setNotice("Your email app should open with this message. Nothing is stored on the website.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="text-sm text-[#f6e7c4]">Name</label>
        <input id="name" name="name" autoComplete="name" required className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="text-sm text-[#f6e7c4]">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="message" className="text-sm text-[#f6e7c4]">Message</label>
        <textarea id="message" name="message" required rows={5} className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
      </div>
      <button type="submit" className="rounded-full bg-[#e8c37a] px-4 py-2 text-sm font-medium text-[#1a1208]">
        Prepare message
      </button>
      {notice ? <p role="status" className="text-sm leading-6 text-[#d9cbb8]">{notice}</p> : null}
    </form>
  );
}
