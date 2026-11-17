"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* Sends the reset link. It lands on the callback, which opens account
   settings, where the new password is set. */
export function ResetForm() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    setEmail(email);
    try {
      const { error: err } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard/settings")}`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 bg-[#fafafa] p-5">
          <p className="text-[18px] font-semibold text-[#0a0e17]">Check your email</p>
          <p className="text-[15px] leading-[22px] text-[rgba(10,14,23,0.75)]">
            We sent a link to <b className="font-semibold text-[#0a0e17]">{email}</b>. Open it on this device to set a new
            password. The link works for a short time.
          </p>
        </div>
        <p className="text-[14px] text-[rgba(10,14,23,0.75)]">
          Wrong email?{" "}
          <button type="button" onClick={() => setSent(false)} className="font-semibold text-[#0a0e17] underline underline-offset-2">Go back</button>
        </p>
        <p className="text-[13px] text-[rgba(10,14,23,0.62)]">Not there? Check spam or promotions, or message us on WhatsApp.</p>
        <Link href="/login" className="text-[14px] font-semibold text-[#0a0e17] underline underline-offset-2">Back to log in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="grid gap-1.5">
        <span className="text-[14px] font-medium text-[#0a0e17]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Input your email"
          className="h-11 w-full rounded-[2px] border border-[#e3e5ea] bg-white px-3.5 text-[14.5px] text-[#0a0a0a] outline-none transition-colors placeholder:text-[#a4a9b5] focus:border-[#3b5bff]"
        />
      </label>
      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-[2px] bg-[#3b5bff] text-[14.5px] font-medium text-white transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send the link"}
      </button>
      <p className="text-center text-[13.5px] text-[#5b6170]">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-[#0a0a0a] underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
