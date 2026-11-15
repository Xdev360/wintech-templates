"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FIELD, GoogleMark, LABEL, OrLine } from "@/components/auth/fields";
import { claimRef } from "@/lib/referral";
import { safeNext } from "@/lib/next-path";
import { createClient } from "@/lib/supabase/client";

/* Unticking "Remember me" keeps the sign-in for half a day instead of the
   usual long spell. Real behaviour, not decoration. */
const SHORT_SESSION = 60 * 60 * 12;

export function AuthForm({ mode, next = "/dashboard" }: { mode: "login" | "signup"; next?: string }) {
  const to = safeNext(next);
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const login = mode === "login";

  function client() {
    return createClient(remember ? undefined : { maxAge: SHORT_SESSION });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const supabase = client();

    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`,
          },
        });
        if (err) throw err;
        // With email confirmation off there is a session already: go straight in.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.push(to);
          router.refresh();
          return;
        }
        setNotice("Check your email and tap the link to confirm. It brings you straight back.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await claimRef(supabase);
        router.push(to);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setPending(false);
    }
  }

  async function withGoogle() {
    setError("");
    setPending(true);
    try {
      const { error: err } = await client().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}` },
      });
      if (err) throw err;
      // On success the browser leaves for Google, so nothing follows here.
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /provider/i.test(message)
          ? "Google sign-in is not switched on yet. Use your email and password for now."
          : message || "That did not work.",
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="grid gap-1.5">
          <span className={LABEL}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Your email address"
            className={FIELD}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={LABEL}>Password</span>
          <span className="relative block">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={login ? "current-password" : "new-password"}
              placeholder="Your password"
              className={`${FIELD} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#8b91a0] hover:text-[#232732]"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[13px] text-[#5b6170]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-[15px] w-[15px] rounded-[4px] accent-[#232732]"
            />
            Remember me
          </label>
          {login ? (
            <Link href="/reset" className="text-[13px] text-[#3b414e] underline-offset-2 hover:underline">
              Forgot password?
            </Link>
          ) : null}
        </div>

        {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
        {notice ? <p className="text-[13px] text-[#5b6170]">{notice}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[12px] bg-[#2f4fe0] text-[13px] font-medium text-white transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-60"
        >
          {pending ? "Working…" : login ? "Login" : "Create account"}
        </button>
      </form>

      <OrLine />

      <button
        type="button"
        onClick={withGoogle}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[12px] border border-[#e3e5ea] bg-white text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f7f8fa] disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <p className="text-center text-[13px] text-[#5b6170]">
        {login ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={login ? `/signup${qs(next)}` : `/login${qs(next)}`}
          className="font-medium text-[#2f4fe0] underline-offset-2 hover:underline"
        >
          {login ? "Sign up here" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

/* Carry the chosen template across when someone switches form. */
function qs(next: string) {
  const i = next.indexOf("?");
  return i === -1 ? "" : next.slice(i);
}
