import type { Metadata } from "next";

import { site } from "@/content/site";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Make It Neat.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-white">Contact</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[#d9cbb8]">
        {site.contactEmail
          ? `Messages open in your email app addressed to ${site.contactEmail}.`
          : "No public email address is configured yet. The form will not claim that a message was delivered."}
      </p>
      <ContactForm />
    </div>
  );
}
