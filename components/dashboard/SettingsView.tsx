"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { changeSiteLink, deleteSite, renameSite, saveBankDetails, setPublished } from "@/app/actions/sites";
import { ROOT_DOMAIN } from "@/lib/config";
import { normalizeSlug } from "@/lib/slugs";
import { Dashed, Label, PageHeader } from "./ui";

/* Settings for one site, in the order people look for them: its name,
   whether it is live, how it looks, and the one thing you cannot undo. */

export const input =
  "h-11 w-full rounded-[12px] bg-page px-3.5 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none transition focus:shadow-[inset_0_0_0_1.5px_var(--accent)]";

export type Bank = { bank?: string; account_name?: string; account_number?: string; note?: string };

export function SettingsView({
  base,
  siteId,
  siteName,
  slug,
  siteUrl,
  accent,
  published,
  bank,
}: {
  base: string;
  siteId: string;
  siteName: string;
  slug: string;
  siteUrl: string;
  accent: string;
  published: boolean;
  bank: Bank;
}) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Site settings" sub="The site name, whether it is live, and your brand colour. Your own name and password are under Account settings." />

      <Row title="Site" hint="The name here is only for you and your dashboard.">
        <SiteForm siteId={siteId} siteName={siteName} slug={slug} siteUrl={siteUrl} />
      </Row>
      <Dashed />
      <Row title="Live or hidden" hint="Hidden sites show visitors a not-found page. Only you can see a hidden site.">
        <VisibilityForm siteId={siteId} published={published} siteUrl={siteUrl} />
      </Row>
      <Dashed />
      <Row title="Brand" hint="Your site's colour. Buttons and links on the site use it.">
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-10 w-10 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]" style={{ background: accent }} />
          <code className="text-[13px]">{accent}</code>
          <Link href={`${base}/site#brand`} className="btn-soft">Change colour</Link>
        </div>
      </Row>
      <Dashed />
      <Row title="Where customers pay you" hint="Shown at checkout. The money goes straight to your bank; Wintech never holds it and takes nothing.">
        <BankForm siteId={siteId} bank={bank} />
      </Row>
      <Dashed />
      <Row title="Delete site" hint="Removes the site and its link for good. Your account and credits stay.">
        <DeleteForm siteId={siteId} slug={slug} />
      </Row>
    </div>
  );
}
export function Row({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <Label className="!text-ink">{title}</Label>
        <p className="mt-1 text-[12px] leading-relaxed text-mute-2">{hint}</p>
      </div>
      <div className="max-w-[520px]">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[13px] text-mute">
      {label}
      {children}
    </label>
  );
}

export function Note({ text, bad }: { text: string; bad?: boolean }) {
  return text ? <p className={`text-[12px] ${bad ? "text-red-600" : "text-mute"}`} role="status">{text}</p> : null;
}


function SiteForm({ siteId, siteName, slug, siteUrl }: { siteId: string; siteName: string; slug: string; siteUrl: string }) {
  const [name, setName] = useState(siteName);
  const [link, setLink] = useState(slug);
  const [note, setNote] = useState({ text: "", bad: false });
  const [pending, start] = useTransition();
  const moving = link.trim().toLowerCase() !== slug;

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          if (moving) {
            const moved = await changeSiteLink(siteId, link);
            if (moved.error) return setNote({ text: moved.error, bad: true });
          }
          const r = await renameSite(siteId, name);
          setNote(r.error ? { text: r.error, bad: true } : { text: moving ? "Saved. Your new address is live." : "Saved.", bad: false });
        });
      }}
    >
      <Field label="Site name">
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </Field>
      <Field label="Link">
        <div className="flex gap-2">
          <span className="flex min-w-0 flex-1 items-center rounded-[10px] bg-page pr-3 shadow-[inset_0_0_0_1px_var(--line-2)] focus-within:shadow-[inset_0_0_0_1.5px_var(--accent)]">
            <input
              className="h-9 min-w-0 flex-1 bg-transparent px-3 text-[13px] outline-none"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={48}
              spellCheck={false}
              aria-label="The name your site answers on"
            />
            <span className="shrink-0 text-[13px] text-mute-2">.{ROOT_DOMAIN}</span>
          </span>
          <button
            type="button"
            className="btn-soft shrink-0"
            onClick={() => navigator.clipboard?.writeText(siteUrl).then(() => setNote({ text: "Link copied.", bad: false }))}
          >
            Copy
          </button>
        </div>
      </Field>
      {moving ? (
        <p className="rounded-[10px] bg-amber-500/10 px-3 py-2 text-[12px] leading-[1.5]">
          Your site will move to <b className="font-medium">{normalizeSlug(link) || "…"}.{ROOT_DOMAIN}</b>. The old
          address keeps working and sends people to the new one, so links you have already shared are safe.
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        <Note {...note} />
      </div>
    </form>
  );
}

/* Bank details. Deliberately not part of the site's content: content is
   written by the editor, by Wintech AI, and by Claude through the
   connector, and none of those should be able to change where money
   goes. Only this form writes it. */
function BankForm({ siteId, bank }: { siteId: string; bank: Bank }) {
  const [state, setState] = useState({
    bank: bank.bank || "",
    account_name: bank.account_name || "",
    account_number: bank.account_number || "",
    note: bank.note || "",
  });
  const [note, setNote] = useState({ text: "", bad: false });
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveBankDetails(siteId, state);
          setNote(r.error ? { text: r.error, bad: true } : { text: "Saved. Your checkout is open.", bad: false });
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Bank">
          <input className={input} value={state.bank} maxLength={60} placeholder="GTBank"
            onChange={(e) => setState({ ...state, bank: e.target.value })} />
        </Field>
        <Field label="Account number">
          <input className={input} value={state.account_number} maxLength={10} inputMode="numeric" placeholder="0123456789"
            onChange={(e) => setState({ ...state, account_number: e.target.value.replace(/[^0-9]/g, "") })} />
        </Field>
      </div>
      <Field label="Account name">
        <input className={input} value={state.account_name} maxLength={80} placeholder="The name on the account"
          onChange={(e) => setState({ ...state, account_name: e.target.value })} />
      </Field>
      <Field label="Anything else the customer should know">
        <input className={input} value={state.note} maxLength={200} placeholder="Use your order reference as the transfer description"
          onChange={(e) => setState({ ...state, note: e.target.value })} />
      </Field>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        <Note {...note} />
      </div>
      <p className="text-[12px] leading-[1.5] text-mute-2">
        Customers see these at checkout and transfer the money themselves. Leave all three empty to
        close checkout again.
      </p>
    </form>
  );
}

function DeleteForm({ siteId, slug }: { siteId: string; slug: string }) {
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const ready = typed.trim().toLowerCase() === slug;

  return (
    <form
      className="grid gap-3 rounded-[12px] bg-red-500/[0.05] p-4 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.18)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        start(async () => {
          const r = await deleteSite(siteId, typed);
          if (r?.error) setNote(r.error);
        });
      }}
    >
      <Field label={`Type ${slug} to confirm`}>
        <input className={input} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
      </Field>
      <div className="flex items-center gap-3">
        <button
          disabled={!ready || pending}
          className="inline-flex h-10 items-center rounded-[13px] bg-red-600 px-4 text-[12px] font-medium text-white disabled:opacity-40"
        >
          {pending ? "Deleting…" : "Delete this site"}
        </button>
        {note ? <p className="text-[12px] text-red-600" role="alert">{note}</p> : null}
      </div>
    </form>
  );
}

function VisibilityForm({ siteId, published, siteUrl }: { siteId: string; published: boolean; siteUrl: string }) {
  const [live, setLive] = useState(published);
  const [note, setNote] = useState({ text: "", bad: false });
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${live ? "bg-emerald-500" : "bg-line-2"}`} aria-hidden="true" />
        <span className="text-[13px]">{live ? "Live. Anyone with the link can open it." : "Hidden."}</span>
        <a href={siteUrl} target="_blank" rel="noreferrer" className="text-[12px] text-accent underline-offset-2 hover:underline">Open</a>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          className="btn-soft disabled:opacity-60"
          onClick={() =>
            start(async () => {
              const r = await setPublished(siteId, !live);
              if (r.error) return setNote({ text: r.error, bad: true });
              setLive(!live);
              setNote({ text: !live ? "Your site is live." : "Your site is hidden.", bad: false });
            })
          }
        >
          {pending ? "Saving…" : live ? "Hide site" : "Publish site"}
        </button>
        <Note {...note} />
      </div>
    </div>
  );
}
