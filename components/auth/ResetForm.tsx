"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* Sends the reset link. It lands on the callback, which opens account
   settings, where the new password is set. */
export function ResetForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
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
      <div className="flex flex-col gap-4">
        <p className="text-[14px] leading-[1.6] text-[#3b414e]">
          Sent. Open the link in that email and it brings you to your settings, where you can
          set a new password. If nothing arrives, check your spam folder.
        </p>
        <Link href="/login" className="text-[13.5px] font-medium text-[#0a0a0a] underline-offset-2 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="grid gap-1.5">
        <span className="text-[13px] font-medium text-[#3b414e]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Input your email"
          className="h-11 w-full rounded-[12px] border border-[#e3e5ea] bg-white px-3.5 text-[14.5px] text-[#0a0a0a] outline-none transition-colors placeholder:text-[#a4a9b5] focus:border-[#232732]"
        />
      </label>
      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-[#151922] text-[14.5px] font-medium text-white transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-60"
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
