"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { createConnectorLink, revokeConnectorLink } from "@/app/actions/connector";

export type ConnectorLink = { id: string; label: string; prefix: string; created_at: string; last_used_at: string | null; revoked_at: string | null };

/* Make a personal link, paste it into Claude, done. The full link shows
   once; after that only its first characters, so links can be told apart
   and revoked without ever being shown again. */
export function ConnectorPanel({ origin, links, local }: { origin: string; links: ConnectorLink[] | null; local: boolean }) {
  const router = useRouter();
  const [label, setLabel] = useState("Claude");
  const [fresh, setFresh] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const active = (links || []).filter((l) => !l.revoked_at);
  const url = fresh ? `${origin}/api/mcp/${fresh}` : "";

  return (
    <section id="connect" className="scroll-mt-5 rounded-[18px] p-4 shadow-[0_0_0_1px_var(--line)]">
      <h2 className="text-[15px] font-medium">Connect</h2>
      <ol className="mt-3 flex flex-col gap-2 text-[13px] text-mute">
        <li><b className="font-medium text-ink">1.</b> Make a link below and copy it.</li>
        <li><b className="font-medium text-ink">2.</b> In Claude, open Settings, then Connectors, and choose Add custom connector.</li>
        <li><b className="font-medium text-ink">3.</b> Name it Wintech and paste the link.</li>
        <li>
          <b className="font-medium text-ink">4.</b> Under Authentication, choose{" "}
          <b className="font-medium text-ink">No sign-in</b>. Your link is the password, so Claude
          does not need to log in separately. Picking anything else gives an error.
        </li>
        <li><b className="font-medium text-ink">5.</b> Save, then ask Claude: “What sites do I have on Wintech?”</li>
      </ol>
      {local ? (
        <p className="mt-3 rounded-[12px] bg-amber-500/10 px-3 py-2 text-[12px]">
          You are on your laptop. Claude can only reach Wintech once the app is live at app.wintechstudio.com, so make the link there.
        </p>
      ) : null}

      {links === null ? (
        <p className="mt-4 rounded-[12px] bg-amber-500/10 px-3 py-2 text-[13px]">Run <code>supabase/004_connector.sql</code> in Supabase to turn this on.</p>
      ) : (
        <>
          {url ? (
            <div className="mt-4 rounded-[12px] bg-soft p-3">
              <p className="text-[12px] font-medium text-ink">Your link. Copy it now: it will not be shown again.</p>
              <div className="mt-2 flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-[10px] bg-page px-3 py-2.5 text-[12px] shadow-[inset_0_0_0_1px_var(--line-2)]">{url}</code>
                <button type="button" className="btn-primary !h-10 shrink-0"
                  onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-[12px] text-mute">Treat it like a password. Anyone with it can edit your sites until you revoke it.</p>
              <LinkCheck url={url} />
            </div>
          ) : null}

          <form className="mt-4 flex gap-2" onSubmit={(e) => {
            e.preventDefault();
            setError("");
            start(async () => {
              const r = await createConnectorLink(label);
              if (r.error) return setError(r.error);
              setFresh(r.token!);
              router.refresh();
            });
          }}>
            <label className="sr-only" htmlFor="link-label">Name this link</label>
            <input id="link-label" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40}
              className="h-11 min-w-0 flex-1 rounded-[12px] bg-page px-3.5 text-[13px] shadow-[inset_0_0_0_1px_var(--line-2)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]" />
            <button disabled={pending} className="btn-primary !h-11 shrink-0 disabled:opacity-60">
              <KeyRound className="h-4 w-4" /> {pending ? "Making…" : "Make a link"}
            </button>
          </form>
          {error ? <p className="mt-2 text-[12px] text-red-600" role="alert">{error}</p> : null}

          {active.length ? (
            <ul className="mt-5 flex flex-col">
              {active.map((l) => (
                <li key={l.id} className="flex items-center gap-3 border-t border-dashed border-line py-3 text-[13px]">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{l.label} <code className="ml-1 text-[12px] text-mute">{l.prefix}…</code></span>
                    <span className="block text-[12px] text-mute">
                      Made {new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {l.last_used_at ? ` · last used ${new Date(l.last_used_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : " · not used yet"}
                    </span>
                  </span>
                  <button type="button" className="btn-soft !h-9" disabled={pending}
                    onClick={() => start(async () => { const r = await revokeConnectorLink(l.id); if (r.error) setError(r.error); router.refresh(); })}>
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}

/* Proves the link works before it goes into Claude: the same first
   message Claude sends, answered by the same endpoint. */
function LinkCheck({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        className="btn-soft !h-8 !px-3"
        disabled={state === "checking"}
        onClick={async () => {
          setState("checking");
          try {
            const r = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "wintech-check", version: "1" } } }),
            });
            const j = (await r.json()) as { result?: unknown; error?: unknown };
            setState(j.result ? "ok" : "bad");
          } catch {
            setState("bad");
          }
        }}
      >
        <KeyRound className="h-3.5 w-3.5" /> {state === "checking" ? "Checking…" : "Check the link"}
      </button>
      {state === "ok" ? <span className="text-[12px] text-emerald-600">Works. Paste it into Claude.</span> : null}
      {state === "bad" ? <span className="text-[12px] text-red-600">Not working. Make a new link and try again.</span> : null}
    </div>
  );
}
