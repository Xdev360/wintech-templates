"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Note, Row, input } from "./SettingsView";
import { Dashed, PageHeader } from "./ui";

/* Settings that belong to the person, not to a site. */

export function AccountSettingsView({ userName, email }: { userName: string; email: string }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Account settings" sub="Your name, email, and password." />
      <Row title="Profile" hint="How Wintech AI and your dashboard address you.">
        <ProfileForm userName={userName} email={email} />
      </Row>
      <Dashed />
      <Row title="Password" hint="At least eight characters.">
        <PasswordForm />
      </Row>
    </div>
  );
}

function ProfileForm({ userName, email }: { userName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(userName);
  const [note, setNote] = useState({ text: "", bad: false });
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const { error } = await createClient().auth.updateUser({ data: { full_name: name.trim() } });
          setNote(error ? { text: error.message, bad: true } : { text: "Saved.", bad: false });
          if (!error) router.refresh();
        });
      }}
    >
      <Field label="Your name">
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </Field>
      <Field label="Email">
        <input className={`${input} text-mute`} value={email} readOnly />
      </Field>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        <Note {...note} />
      </div>
    </form>
  );
}

function PasswordForm() {
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [note, setNote] = useState({ text: "", bad: false });
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (pw.length < 8) return setNote({ text: "Use at least eight characters.", bad: true });
        if (pw !== again) return setNote({ text: "The two passwords do not match.", bad: true });
        start(async () => {
          const { error } = await createClient().auth.updateUser({ password: pw });
          setNote(error ? { text: error.message, bad: true } : { text: "Password changed.", bad: false });
          if (!error) { setPw(""); setAgain(""); }
        });
      }}
    >
      <Field label="New password">
        <input className={input} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Type it again">
        <input className={input} type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" />
      </Field>
      <div className="flex items-center gap-3">
        <button className="btn-soft" disabled={pending}>{pending ? "Saving…" : "Change password"}</button>
        <Note {...note} />
      </div>
    </form>
  );
}
