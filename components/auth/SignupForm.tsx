"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { FIELD, GoogleMark, LABEL, OrLine } from "@/components/auth/fields";
import { ROOT_DOMAIN } from "@/lib/config";
import { safeNext } from "@/lib/next-path";
import { claimRef, rememberRef } from "@/lib/referral";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/client";

/* ──────────────────────────────────────────────────────────────
   Sign up. Name, the link you want, email, password.

   The link is checked against the database as you type, the same check
   the home page uses. It is optional: leave it blank and you choose it
   after the template. Nothing here is stored until the account is made.
   ────────────────────────────────────────────────────────────── */

const MIN_PASSWORD = 8;

export function SignupForm({ next = "/dashboard", referral }: { next?: string; referral?: string }) {
  const router = useRouter();
  const to = safeNext(next);
  const [fullName, setFullName] = useState("");
  const [rawSlug, setRawSlug] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [taken, setTaken] = useState<Record<string, boolean>>({});

  const slug = normalizeSlug(rawSlug);
  const slugProblem = slug ? slugError(slug) : null;
  const free = slug && !slugProblem ? taken[slug] : undefined;

  useEffect(() => {
    if (!slug || slugProblem || slug in taken) return;
    let live = true;
    const t = setTimeout(async () => {
      try {
        const { data, error: err } = await createClient().rpc("slug_available", { p_slug: slug });
        if (live && !err) setTaken((m) => ({ ...m, [slug]: Boolean(data) }));
      } catch {
        // The check is a courtesy; the real one happens when the site is made.
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [slug, slugProblem, taken]);

  /** Carry the chosen name through to the new-site page. */
  function target() {
    if (!slug || slugProblem) return to;
    const [path, query = ""] = to.split("?");
    const params = new URLSearchParams(query);
    params.set("name", slug);
    return `${path.startsWith("/dashboard") ? path : "/dashboard/new"}?${params}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters for the password.`);
    // Keep the code if the account needs an email confirmation first.
    rememberRef(referral);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const supabase = createClient();
    const go = target();

    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim().slice(0, 60) },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(go)}`,
        },
      });
      if (err) throw err;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await claimRef(supabase, referral);
        router.push(go);
        router.refresh();
        return;
      }
      setNotice("Check your email and tap the link to confirm. It brings you straight back.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setPending(false);
    }
  }

  async function withGoogle() {
    setError("");
    setPending(true);
    // The browser is about to leave for Google, so the code has to wait
    // here. ClaimReferral picks it up when they land in the dashboard.
    rememberRef(referral);
    try {
      const { error: err } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target())}` },
      });
      if (err) throw err;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /provider/i.test(message)
          ? "Google sign-up is not switched on yet. Use your email and password for now."
          : message || "That did not work.",
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="grid gap-1.5">
          <span className={LABEL}>Your name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Your full name"
            className={FIELD}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={LABEL}>
            Your link <span className="font-normal text-[#8b91a0]">· optional</span>
          </span>
          <span className="relative block">
            <input
              value={rawSlug}
              onChange={(e) => setRawSlug(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="your-business"
              className={`${FIELD} pr-9`}
            />
            {free === true ? (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" strokeWidth={3} />
            ) : free === false ? (
              <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" strokeWidth={3} />
            ) : null}
          </span>
          <span className="text-[12px] leading-[1.45] text-[#8b91a0]">
            {slugProblem
              ? slugProblem
              : free === false
                ? "That one is taken. Try another."
                : `${slug || "your-name"}.${ROOT_DOMAIN}`}
          </span>
        </label>

        <label className="grid gap-1.5">
          <span className={LABEL}>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="Your email address" className={FIELD} />
        </label>

        <label className="grid gap-1.5">
          <span className={LABEL}>Password</span>
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              required
              minLength={MIN_PASSWORD}
              autoComplete="new-password"
              placeholder="Your password"
              className={`${FIELD} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#8b91a0] hover:text-[#232732]"
            >
              {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </span>
          <span className="text-[12px] text-[#8b91a0]">At least {MIN_PASSWORD} characters. Nothing else required.</span>
        </label>

        {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
        {notice ? <p className="text-[13px] text-[#5b6170]">{notice}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[12px] bg-[#2f4fe0] text-[14.5px] font-medium text-white transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-60"
        >
          {pending ? "Working…" : "Continue"}
        </button>

        <p className="text-center text-[13px] text-[#5b6170]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#2f4fe0] underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </form>

      <OrLine />

      <button
        type="button"
        onClick={withGoogle}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[12px] border border-[#e3e5ea] bg-white text-[14.5px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f7f8fa] disabled:opacity-60"
      >
        <GoogleMark />
        Sign up with Google
      </button>

      <p className="text-center text-[11.5px] leading-[1.5] text-[#8b91a0]">
        One free site, no card needed. You can delete your account at any time from settings.
      </p>
    </div>
  );
}
