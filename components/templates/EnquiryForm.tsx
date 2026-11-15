"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   The form on a customer's live site. A visitor writes their name, a
   way to reach them, and a message; it lands in the owner's Inbox.

   Before this, every template's button was a mailto: link, which opens
   a mail app most phone users do not have set up. This is the
   difference between a site that looks like a business and one that
   gets business.

   In a preview it renders the same but does nothing, so the owner sees
   exactly what their visitors will see.
   ────────────────────────────────────────────────────────────── */

export function EnquiryForm({ slug, cta, live }: { slug: string; cta: string; live?: boolean }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!live) return;
    const form = new FormData(e.currentTarget);
    // A robot fills every field it finds. A person never sees this one.
    if (String(form.get("company") || "")) return setSent(true);

    setError("");
    setPending(true);
    try {
      const { error: err } = await createClient().rpc("submit_enquiry", {
        p_slug: slug,
        p_name: String(form.get("name") || ""),
        p_contact: String(form.get("contact") || ""),
        p_message: String(form.get("message") || ""),
      });
      if (err) throw new Error(err.message);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="tpl-form__done" role="status">
        Thank you. Your message has been sent — you will hear back soon.
      </p>
    );
  }

  return (
    <form className="tpl-form" onSubmit={onSubmit}>
      <div className="tpl-form__row">
        <input className="tpl-input" name="name" placeholder="Your name" required maxLength={60} autoComplete="name" />
        <input className="tpl-input" name="contact" placeholder="Phone or email" required maxLength={80} autoComplete="tel" />
      </div>
      <textarea className="tpl-input tpl-input--area" name="message" placeholder="What do you need?" required rows={3} maxLength={1200} />
      <input className="tpl-hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error ? <p className="tpl-form__error">{error}</p> : null}
      <button type="submit" className="tpl-btn tpl-btn--invert" disabled={pending}>
        {pending ? "Sending…" : cta}
      </button>
    </form>
  );
}
