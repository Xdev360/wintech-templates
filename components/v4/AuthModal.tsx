"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Clock, Eye, EyeOff, X } from "lucide-react";
import { GoogleMark } from "@/components/auth/fields";
import { safeNext } from "@/lib/next-path";
import { claimRef, rememberRef } from "@/lib/referral";
import { createClient } from "@/lib/supabase/client";
import { MascotSays, Mascot, useCaretLook, type Eyes } from "./Mascot";

/* ──────────────────────────────────────────────────────────────
   Sign up and log in with Wintech AI (Figma page 24, SU1 to SU8).
   A modal over the marketing page. The mascot reacts as the owner
   types. Sign up runs on a 6-digit email code (Supabase OTP), then a
   password, then "You're in".
   ────────────────────────────────────────────────────────────── */

const SHORT_SESSION = 60 * 60 * 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Step = "details" | "code" | "password" | "done";

const INPUT =
  "h-10 w-full rounded-[2px] border border-[rgba(10,14,23,0.1)] bg-white px-3 text-[15px] text-[#0a0e17] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(10,14,23,0.45)] focus:border-[#3b5bff] focus:shadow-[0_0_0_3px_rgba(59,91,255,0.15)]";
const PRIMARY =
  "flex h-10 w-full items-center justify-center rounded-[2px] bg-[#3b5bff] text-[16px] font-medium text-white transition-colors hover:bg-[#2f4be6] disabled:opacity-60";

function AppleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.07-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.08 1.35 10.73.9 1.29 1.96 2.75 3.36 2.7 1.35-.05 1.86-.87 3.49-.87s2.09.87 3.51.84c1.45-.03 2.37-1.32 3.26-2.62 1.03-1.5 1.45-2.95 1.47-3.03-.03-.01-2.82-1.08-2.85-4.29zM13.7 4.67c.74-.9 1.24-2.15 1.11-3.4-1.07.04-2.37.71-3.14 1.61-.69.8-1.29 2.08-1.13 3.3 1.19.09 2.41-.6 3.16-1.51z" />
    </svg>
  );
}

function Social({ onPick, pending }: { onPick: (p: "google" | "apple") => void; pending: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <button type="button" disabled={pending} onClick={() => onPick("google")} className="flex h-10 items-center justify-center gap-2.5 rounded-[2px] border border-[rgba(10,14,23,0.24)] bg-white text-[15px] font-medium text-[#0a0e17] hover:bg-[#fafafa] disabled:opacity-60">
          <GoogleMark /> Continue with Google
        </button>
        <button type="button" disabled={pending} onClick={() => onPick("apple")} className="flex h-10 items-center justify-center gap-2.5 rounded-[2px] border border-[rgba(10,14,23,0.24)] bg-white text-[15px] font-medium text-[#0a0e17] hover:bg-[#fafafa] disabled:opacity-60">
          <AppleMark /> Continue with Apple
        </button>
      </div>
      <div className="flex items-center gap-3 text-[13px] text-[rgba(10,14,23,0.62)]">
        <span className="h-px flex-1 bg-[rgba(10,14,23,0.1)]" /> or <span className="h-px flex-1 bg-[rgba(10,14,23,0.1)]" />
      </div>
    </>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-medium text-[#0a0e17]">{label}</span>
      {children}
      {hint}
    </label>
  );
}

function Err({ text }: { text: string }) {
  return text ? <p role="alert" className="rounded-[2px] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#b91c1c]">{text}</p> : null;
}

/** A bare modal frame with the close button, for pages like password reset. */
export function ModalFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,14,23,0.32)] p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={label}>
      <div className="modal-in relative w-full max-w-[480px] border border-[rgba(10,14,23,0.1)] bg-white p-10 shadow-[0_24px_60px_rgba(10,14,23,0.18)] max-sm:p-6">
        <Link href="/login" aria-label="Close" className="absolute right-6 top-6 text-[rgba(10,14,23,0.62)] hover:text-[#0a0e17]"><X className="h-5 w-5" strokeWidth={1.5} /></Link>
        {children}
      </div>
    </div>
  );
}

export function AuthModal({ mode, next = "/dashboard", referral, onClose }: { mode: "signup" | "login"; next?: string; referral?: string; onClose?: () => void }) {
  const router = useRouter();
  const to = safeNext(next);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const close = () => (onClose ? onClose() : router.push("/"));
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });

  async function oauth(provider: "google" | "apple") {
    setError("");
    setPending(true);
    rememberRef(referral);
    try {
      const { error: err } = await createClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}` },
      });
      if (err) throw err;
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setError(/provider|not enabled|unsupported/i.test(m) ? `${provider === "google" ? "Google" : "Apple"} sign-in is not switched on yet. Use your email for now.` : m || "That did not work.");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,14,23,0.1)] p-4" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Log in" : "Create your free account"}>
      <div className="modal-in relative max-h-[calc(100vh-32px)] w-full max-w-[480px] overflow-y-auto border border-[rgba(10,14,23,0.1)] bg-white p-10 shadow-[0_24px_60px_rgba(10,14,23,0.18)] max-sm:p-6">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-6 top-6 text-[rgba(10,14,23,0.62)] hover:text-[#0a0e17]">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        {mode === "login" ? (
          <Login to={to} pending={pending} setPending={setPending} error={error} setError={setError} oauth={oauth} />
        ) : (
          <Signup to={to} referral={referral} pending={pending} setPending={setPending} error={error} setError={setError} oauth={oauth} close={close} />
        )}
      </div>
    </div>
  );
}

type Shared = { to: string; pending: boolean; setPending: (v: boolean) => void; error: string; setError: (v: string) => void; oauth: (p: "google" | "apple") => void };

/* ── Sign up ───────────────────────────────────────────────────── */

function Signup({ to, referral, pending, setPending, error, setError, oauth, close }: Shared & { referral?: string; close: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focus, setFocus] = useState<"name" | "email" | null>(null);
  const look = useCaretLook();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [shake, setShake] = useState(false);
  const [left, setLeft] = useState(0);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const first = name.trim().split(/\s+/)[0] || "";
  const validEmail = EMAIL_RE.test(email.trim());

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function sendCode() {
    setError("");
    setPending(true);
    rememberRef(referral);
    try {
      const { error: err } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, data: { full_name: name.trim().slice(0, 60) } },
      });
      if (err) throw err;
      setStep("code");
      setLeft(60);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => boxes.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send the code. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function verify(digits = code) {
    const token = digits.join("");
    if (token.length < 6) return;
    setError("");
    setPending(true);
    try {
      const { error: err } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: "email" });
      if (err) throw err;
      setStep("password");
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setError("That code is not right. Check the latest email and try again.");
    } finally {
      setPending(false);
    }
  }

  function typeDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "");
    if (d.length > 1) {
      const all = d.slice(0, 6).split("");
      const nextCode = [...all, ...Array(6 - all.length).fill("")].slice(0, 6);
      setCode(nextCode);
      boxes.current[Math.min(all.length, 5)]?.focus();
      if (all.length === 6) verify(nextCode);
      return;
    }
    const nextCode = code.map((c, k) => (k === i ? d : c));
    setCode(nextCode);
    if (d && i < 5) boxes.current[i + 1]?.focus();
    if (nextCode.every(Boolean)) verify(nextCode);
  }

  const checks = [password.length >= 8, /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = password ? checks.filter(Boolean).length + (password.length >= 12 ? 1 : 0) : 0;
  const strength = ["", "Weak password", "Okay password", "Strong password", "Very strong password"][score];

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!checks[0] || !checks[1]) return setError("Use 8 or more characters with at least one number.");
    setError("");
    setPending(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password, data: { full_name: name.trim().slice(0, 60) } });
      if (err) throw err;
      await claimRef(supabase, referral);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setPending(false);
    }
  }

  if (step === "done") {
    const firstSite = to.startsWith("/dashboard/new") ? to : `/dashboard/new${to.includes("?") ? `?${to.split("?")[1]}` : ""}`;
    return (
      <div className="flex flex-col items-center text-center">
        <span className="mascot-pop"><Mascot eyes="happy" size={88} /></span>
        <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.02em]">You&apos;re in{first ? `, ${first}` : ""}.</h2>
        <p className="mt-4 text-[16px] leading-6 text-[rgba(10,14,23,0.75)]">
          Your account is ready. Next, tell Wintech AI about your business and it will build your first site in about two minutes.
        </p>
        <ul className="mt-6 flex w-full flex-col gap-3 border border-[rgba(10,14,23,0.1)] bg-[#fafafa] p-4 text-left text-[14px] text-[rgba(10,14,23,0.75)]">
          {[`Email confirmed · ${email}`, "Free plan · 0% cut of your sales", "WhatsApp orders built in"].map((t, i) => (
            <li key={t} className="tick-in flex items-center gap-2.5" style={{ animationDelay: `${i * 60}ms` }}>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803d]" strokeWidth={1.5} /> {t}
            </li>
          ))}
        </ul>
        <button type="button" className={`${PRIMARY} mt-6`} onClick={() => { router.push(firstSite); router.refresh(); }}>Create my first site</button>
        <button type="button" className="mt-4 text-[15px] text-[rgba(10,14,23,0.75)] hover:text-[#0a0e17]" onClick={() => { router.push("/dashboard"); router.refresh(); }}>I&apos;ll do it later</button>
      </div>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={savePassword} className="flex flex-col gap-5">
        <MascotSays eyes={pwFocus ? "shut" : "open"} text={pwFocus ? "I'm not looking." : "Almost there."} />
        <div>
          <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Set a password</h2>
          <p className="mt-2 text-[15px] text-[rgba(10,14,23,0.75)]">Email confirmed. One last step{first ? `, ${first}` : ""}.</p>
        </div>
        <Field label="Password">
          <span className="relative block">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              autoComplete="new-password"
              autoFocus
              className={`${INPUT} pr-10`}
            />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(10,14,23,0.62)]">
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </span>
        </Field>
        <div>
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-1 bg-[rgba(10,14,23,0.08)]">
                <span className="block h-full bg-[#15803d] transition-[width] duration-200" style={{ width: i < score ? "100%" : "0%", transitionDelay: `${i * 80}ms` }} />
              </span>
            ))}
          </div>
          {strength && <p className={`mt-2 text-[13px] ${score >= 3 ? "text-[#15803d]" : "text-[rgba(10,14,23,0.62)]"}`}>{strength}</p>}
        </div>
        <ul className="flex flex-col gap-2 text-[14px]">
          {["8 or more characters", "At least one number", "A symbol makes it stronger"].map((t, i) => (
            <li key={t} className={`flex items-center gap-2.5 ${checks[i] ? "text-[rgba(10,14,23,0.75)]" : "text-[rgba(10,14,23,0.45)]"}`}>
              <Check className={`h-4 w-4 ${checks[i] ? "text-[#15803d]" : ""}`} strokeWidth={1.5} /> {t}
            </li>
          ))}
        </ul>
        <Err text={error} />
        <button type="submit" disabled={pending} className={PRIMARY}>{pending ? "Saving" : "Create my free account"}</button>
      </form>
    );
  }

  if (step === "code") {
    const m = Math.floor(left / 60), s = String(left % 60).padStart(2, "0");
    return (
      <form onSubmit={(e) => { e.preventDefault(); verify(); }} className="flex flex-col gap-5">
        <MascotSays eyes={code.some(Boolean) ? "happy" : "open"} text="Check your inbox." />
        <div>
          <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Check your inbox</h2>
          <p className="mt-2 text-[15px] leading-[22px] text-[rgba(10,14,23,0.75)]">We sent a 6-digit code to {email.trim()}. It expires in 10 minutes.</p>
        </div>
        <div className={`flex gap-2 ${shake ? "otp-shake" : ""}`}>
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { boxes.current[i] = el; }}
              value={c}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              maxLength={i === 0 ? 6 : 1}
              onChange={(e) => typeDigit(i, e.target.value)}
              onKeyDown={(e) => e.key === "Backspace" && !c && i > 0 && boxes.current[i - 1]?.focus()}
              className={`otp-box h-12 w-12 rounded-[2px] border bg-white text-center text-[20px] font-medium outline-none focus:border-[#3b5bff] max-sm:w-11 ${shake ? "border-[#dc2626]" : "border-[rgba(10,14,23,0.24)]"}`}
            />
          ))}
        </div>
        <p className="flex flex-wrap items-center gap-2 text-[13px] text-[rgba(10,14,23,0.62)]">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          {left > 0 ? <span>Resend code in {m}:{s}</span> : <button type="button" onClick={sendCode} className="font-medium text-[#3b5bff] underline">Resend code</button>}
          <span>·</span>
          <button type="button" onClick={() => { setStep("details"); setError(""); }} className="font-medium text-[#3b5bff] underline">Wrong email? Change it</button>
        </p>
        <Err text={error} />
        <button type="submit" disabled={pending || code.some((c) => !c)} className={PRIMARY}>{pending ? "Checking" : "Verify email"}</button>
        <p className="text-[13px] text-[rgba(10,14,23,0.62)]">Tip: the code can land in Promotions or Spam.</p>
      </form>
    );
  }

  /* details: the pupils follow the caret while you type */
  const eyes: Eyes = focus === "email" && validEmail ? "happy" : look != null ? "open" : name ? "happy" : "open";
  const say = focus === "email" ? (validEmail ? "That looks right." : "Where should I send your code?") : first ? `Nice to meet you, ${first}.` : "Hi! I'm Wintech AI. What should I call you?";
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return setError("Tell us what to call you."); if (!validEmail) return setError("Check your email address."); sendCode(); }} className="flex flex-col gap-5">
      <MascotSays eyes={eyes} text={say} look={look} />
      <div>
        <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Create your free account</h2>
        <p className="mt-2 text-[15px] text-[rgba(10,14,23,0.75)]">Join business owners across Nigeria. No card needed.</p>
      </div>
      <Social onPick={oauth} pending={pending} />
      <Field label="Your name">
        <input value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setFocus("name")} placeholder="What should we call you?" autoComplete="given-name" className={INPUT} />
      </Field>
      <Field label="Email" hint={validEmail ? <span className="text-[13px] text-[rgba(10,14,23,0.62)]">We will send a 6-digit code here.</span> : null}>
        <span className="relative block">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocus("email")}
            placeholder="you@yourbusiness.com"
            autoComplete="email"
            className={`${INPUT} pr-10 ${validEmail ? "!border-[#15803d]" : ""}`}
          />
          {validEmail && <CheckCircle2 className="tick-draw absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#15803d]" strokeWidth={1.5} />}
        </span>
      </Field>
      <Err text={error} />
      <button type="submit" disabled={pending} className={PRIMARY}>{pending ? "Sending your code" : "Create my free account"}</button>
      <p className="text-center text-[15px] text-[rgba(10,14,23,0.75)]">
        Already have an account? <Link href={`/login${to !== "/dashboard" ? `?next=${encodeURIComponent(to)}` : ""}`} className="font-medium text-[#3b5bff] underline">Log in</Link>
      </p>
      <p className="text-center text-[12px] text-[rgba(10,14,23,0.62)]">
        By continuing you agree to the <Link href="/terms" className="underline-offset-2 hover:underline">Terms</Link> and the <Link href="/privacy" className="underline-offset-2 hover:underline">Privacy Policy</Link>.
      </p>
      <button type="button" onClick={close} className="sr-only">Close</button>
    </form>
  );
}

/* ── Log in ────────────────────────────────────────────────────── */

function Login({ to, pending, setPending, error, setError, oauth }: Shared) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [pwFocus, setPwFocus] = useState(false);
  const look = useCaretLook();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const { error: err } = await createClient(remember ? undefined : { maxAge: SHORT_SESSION }).auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      router.push(to);
      router.refresh();
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setError(/invalid/i.test(m) ? "That email and password do not match. Try again or reset your password." : m || "That did not work.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <MascotSays eyes={pwFocus ? "shut" : "open"} look={look} text={pwFocus ? "I'm not looking." : "Good to see you again."} />
      <div>
        <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Welcome back</h2>
        <p className="mt-2 text-[15px] text-[rgba(10,14,23,0.75)]">Log in to manage your sites, orders and money.</p>
      </div>
      <Social onPick={oauth} pending={pending} />
      <Field label="Email">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@yourbusiness.com" className={INPUT} />
      </Field>
      <Field label="Password">
        <span className="relative block">
          <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setPwFocus(true)} onBlur={() => setPwFocus(false)} autoComplete="current-password" className={`${INPUT} pr-10`} />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(10,14,23,0.62)]">
            {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </span>
      </Field>
      <div className="flex items-center justify-between text-[14px]">
        <label className="flex cursor-pointer items-center gap-2.5 text-[rgba(10,14,23,0.75)]">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#3b5bff]" /> Keep me logged in
        </label>
        <Link href="/reset" className="font-medium text-[#3b5bff] underline">Forgot password?</Link>
      </div>
      <Err text={error} />
      <button type="submit" disabled={pending} className={PRIMARY}>{pending ? "Logging in" : "Log in"}</button>
      <p className="text-center text-[15px] text-[rgba(10,14,23,0.75)]">
        New here? <Link href={`/signup${to !== "/dashboard" ? `?next=${encodeURIComponent(to)}` : ""}`} className="font-medium text-[#3b5bff] underline">Create a free account</Link>
      </p>
    </form>
  );
}
