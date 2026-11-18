"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Check, Clock, Image as ImageIcon, LayoutTemplate, Mic, Minus, PenLine, Send, Sparkles, Type } from "lucide-react";
import { CREDIT_PACKS } from "@/lib/credits";
import { CurrencyToggle, PLANS } from "./home";
import { TextLink } from "./ui";

const S = 1.5;
type Cur = "NGN" | "USD";
type Period = "month" | "year";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const num = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

function price(p: (typeof PLANS)[number], cur: Cur, period: Period) {
  const base = num(cur === "NGN" ? p.ngn : p.usd);
  const sym = (n: number) => (cur === "NGN" ? naira(n) : `$${n.toLocaleString("en-US")}`);
  if (period === "month") return { big: sym(base), unit: "/ month", other: cur === "NGN" ? `${p.usd} per month` : `${p.ngn} per month` };
  /* Yearly: two months free, so ten months' price for twelve. */
  const year = base * 10;
  return { big: sym(year), unit: "/ year", other: base ? `${sym(Math.round(year / 12))} a month, 2 months free` : "Free forever" };
}

export function PricingPlans() {
  const [cur, setCur] = useState<Cur>("NGN");
  const [period, setPeriod] = useState<Period>("month");
  return (
    <section className="wrap pb-[96px]">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="hair inline-flex p-[3px]" role="radiogroup" aria-label="Billing period">
          {(["month", "year"] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={`h-7 rounded-[2px] px-3 text-[13px] ${period === p ? "bg-[var(--v4-ink)] text-white" : "text-[var(--v4-m75)]"}`}
            >
              {p === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        <CurrencyToggle cur={cur} setCur={setCur} />
        <span className="tag tag-sm tag-warm !py-1">Yearly: 2 months free</span>
      </div>
      <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const pr = price(p, cur, period);
          return (
            <div key={p.name} className={`flex flex-col p-6 ${p.best ? "border border-[var(--v4-ink)] bg-[var(--v4-soft)]" : "hair bg-white"}`}>
              <div className="flex items-center justify-between">
                <p className="text-[20px] font-semibold">{p.name}</p>
                {p.best && <span className="tag tag-sm tag-warm">Recommended</span>}
              </div>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.02em]">{pr.big}</span>
                <span className="text-[14px] text-[var(--v4-m62)]">{pr.unit}</span>
              </p>
              <p className="mt-2 text-[12px] text-[var(--v4-m62)]">{pr.other}</p>
              <p className="mt-6 min-h-[42px] text-[15px] leading-[21px] text-[var(--v4-m75)]">{p.note}</p>
              <Link href="/create" className={`btn mt-4 w-full ${p.best ? "btn-primary" : "btn-secondary"}`}>{p.cta}</Link>
              <ul className="mt-6 flex flex-col gap-3 border-t border-[var(--v4-line)] pt-6">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] leading-5 text-[var(--v4-m75)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--v4-ink)]" strokeWidth={S} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-[13px] text-[var(--v4-m62)]">
        Prices include no cut of your sales. Customers pay you straight into your own bank account.
      </p>
    </section>
  );
}

/* ── Compare table ─────────────────────────────────────────────── */

type Cell = string | boolean;
const COMPARE: [string, [string, Cell[]][]][] = [
  ["Price", [
    ["Monthly, naira", ["₦0", "₦6,000", "₦15,000", "₦37,500"]],
    ["Monthly, dollars", ["$0", "$4", "$10", "$25"]],
    ["Cut of your sales", ["0%", "0%", "0%", "0%"]],
  ]],
  ["Sites and address", [
    ["Sites", ["1", "1", "3", "10"]],
    ["Free name.wintechstudio.com address", [true, true, true, true]],
    ["Your own domain", [false, true, true, true]],
    ["Wintech badge on site", [true, false, false, false]],
  ]],
  ["AI", [
    ["AI credits included", ["30", "150", "300", "1,000"]],
    ["Reply drafts a month", ["50", "300", "TBC", "TBC"]],
  ]],
  ["Selling", [
    ["Bank transfer checkout", [true, true, true, true]],
    ["Card and USSD checkout", ["Coming later", "Coming later", "Coming later", "Coming later"]],
    ["Orders and receipts", [false, true, true, true]],
    ["Weekly report", [false, false, true, true]],
    ["Mobile manager", [false, false, true, true]],
    ["Premium store templates", ["Full price", "Full price", "20% off", "20% off"]],
  ]],
  ["Team and help", [
    ["Team seats", [false, false, false, true]],
    ["Priority help on WhatsApp", [false, false, false, true]],
  ]],
];

export function CompareTable() {
  return (
    <section className="border-t border-[var(--v4-line)] py-[120px] max-md:py-20">
      <div className="wrap">
        <p className="eyebrow">Compare</p>
        <h2 className="h2s mt-4">Compare all plans</h2>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <thead>
              <tr className="text-left">
                <th className="w-[34%] py-4 font-medium" />
                {PLANS.map((p) => (
                  <th key={p.name} className="py-4 text-center text-[15px] font-semibold">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([group, rows]) => (
                <Fragment key={group}>
                  <tr>
                    <td colSpan={5} className="eyebrow border-y border-[var(--v4-line)] bg-[var(--v4-soft)] px-3 py-2.5">{group}</td>
                  </tr>
                  {rows.map(([label, cells]) => (
                    <tr key={label} className="border-b border-[var(--v4-line)]">
                      <td className="px-3 py-3.5 text-[var(--v4-m75)]">{label}</td>
                      {cells.map((c, i) => (
                        <td key={i} className="py-3.5 text-center">
                          {c === true ? (
                            <Check className="mx-auto h-4 w-4" strokeWidth={S} aria-label="Included" />
                          ) : c === false ? (
                            <Minus className="mx-auto h-4 w-4 text-[var(--v4-m45)]" strokeWidth={S} aria-label="Not included" />
                          ) : (
                            <span className={c === "TBC" ? "text-[var(--v4-m62)]" : ""}>{c}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-[12px] text-[var(--v4-m62)]">Reply drafts on Grow and Business are not set yet. Shown as TBC.</p>
      </div>
    </section>
  );
}

/* ── Credits explainer ─────────────────────────────────────────── */

const COSTS: [string, typeof Type, string][] = [
  ["Change a word or price", Type, "1"],
  ["Rewrite a section", PenLine, "3"],
  ["Build a full site", LayoutTemplate, "10"],
  ["Make a product photo", ImageIcon, "4"],
  ["Ask by voice", Mic, "2"],
  ["Draft a reply to a customer", Send, "Free"],
  ["Weekly report", Sparkles, "Free"],
];
const USD_PACK: Record<string, string> = { starter: "$1.70", growth: "$6.70", studio: "$23" };

export function CreditsExplainer() {
  return (
    <section id="credits" className="scroll-mt-28 bg-dots py-[120px] max-md:py-20">
      <div className="wrap grid gap-16 lg:grid-cols-[1fr_1.35fr]">
        <div className="flex flex-col gap-5">
          <p className="eyebrow">AI credits</p>
          <h2 className="h2s">How AI credits work</h2>
          <p className="intro">
            Credits pay for the AI work on your site. Small edits cost little, a full build costs more. Every plan includes credits,
            and you can top up with packs that never expire.
          </p>
          <div className="mt-2"><TextLink href="/help">Read the credits guide</TextLink></div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="hair bg-white">
            <p className="eyebrow flex justify-between border-b border-[var(--v4-line)] px-4 py-3"><span>What you ask for</span><span>Credits</span></p>
            {COSTS.map(([l, I, c], i) => (
              <p key={l} className={`flex items-center gap-3 px-4 py-3.5 text-[14px] ${i < COSTS.length - 1 ? "border-b border-[var(--v4-line)]" : ""}`}>
                <I className="h-4 w-4 text-[var(--v4-m62)]" strokeWidth={S} />
                <span className="flex-1">{l}</span>
                <span className="font-semibold">{c}</span>
              </p>
            ))}
          </div>
          <div>
            <p className="text-[16px] font-semibold">Credit packs</p>
            <div className="hair mt-4 grid bg-white sm:grid-cols-3">
              {CREDIT_PACKS.map((p, i) => (
                <div key={p.id} className={`flex flex-col gap-1 p-5 ${i ? "border-[var(--v4-line)] sm:border-l max-sm:border-t" : ""}`}>
                  <span className="text-[12px] text-[var(--v4-m62)]">{p.credits.toLocaleString("en-US")} credits</span>
                  <span className="text-[28px] font-semibold tracking-[-0.02em]">{p.price}</span>
                  <span className="text-[12px] text-[var(--v4-m62)]">{USD_PACK[p.id]}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--v4-m75)]">
              <Clock className="h-4 w-4" strokeWidth={S} /> Packs never expire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
