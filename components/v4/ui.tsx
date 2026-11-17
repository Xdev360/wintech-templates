import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/* Shared bits of the v4 marketing site (Figma page 17, "Web kit v4"). */

export const WHATSAPP = "https://wa.me/2349134071813";
export const WHATSAPP_LABEL = "+234 913 407 1813";
export const EMAIL = "hello@wintechstudio.com";
export const STUDIO = "https://wintechstudio.com";

const W =
  "M23.0808 0C22.6637 0 22.2854 0.244941 22.1148 0.625574L16.8277 12.42L11.5405 0.625574C11.3699 0.244948 10.9916 4.16414e-06 10.5745 0H1.05987C0.286527 0 -0.225823 0.802245 0.0994417 1.50386L10.2226 23.3397C10.6044 24.1633 11.7777 24.1558 12.149 23.3275L16.8277 12.8905L21.5273 23.3744C21.8948 24.1941 23.0521 24.2125 23.4452 23.4045L34.0932 1.52181C34.4353 0.818659 33.9233 7.42435e-06 33.1412 0H23.0808Z";

/** The sliced-W mark: two navy bands and a blue one, as on page 07 Brand. */
export function Mark({ className = "h-[18px] w-auto", tone = "#0B1638" }: { className?: string; tone?: string }) {
  return (
    <svg className={className} viewBox="0 0 35 24" aria-hidden="true">
      <defs>
        <clipPath id="wm-a"><rect width="35" height="6.64" /></clipPath>
        <clipPath id="wm-b"><rect y="8.68" width="35" height="6.64" /></clipPath>
        <clipPath id="wm-c"><rect y="17.36" width="35" height="6.64" /></clipPath>
      </defs>
      <path d={W} fill={tone} clipPath="url(#wm-a)" />
      <path d={W} fill={tone} clipPath="url(#wm-b)" />
      <path d={W} fill="#3B5BFF" clipPath="url(#wm-c)" />
    </svg>
  );
}

export function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-[10px]" aria-label="Wintech Templates home">
      <Mark className="h-[17.7px] w-[25.2px]" tone={dark ? "#FFFFFF" : "#0B1638"} />
      <span className="flex items-center gap-[5.6px] text-[20.17px] leading-[1.08] tracking-[-0.03em]">
        <span className={`font-semibold ${dark ? "text-white" : "text-[#0b1638]"}`}>Wintech</span>
        <span className={`font-medium ${dark ? "text-[#8c97b8]" : "text-[#8a93a6]"}`}>Templates</span>
      </span>
    </Link>
  );
}

export function Btn({
  href,
  children,
  kind = "primary",
  size,
  arrow = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  kind?: "primary" | "secondary" | "outline" | "inverse" | "ghost";
  size?: "sm";
  arrow?: boolean;
  className?: string;
}) {
  const cls = `btn btn-${kind} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  const inner = (
    <>
      {children}
      {arrow && <ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
    </>
  );
  return href.startsWith("http") || href.startsWith("mailto:") ? (
    <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link">
      {children}
      <ArrowRight className="h-[14px] w-[14px]" strokeWidth={1.5} />
    </Link>
  );
}

/** Section heading: eyebrow, H2, optional intro. Centred or left. */
export function Head({
  eyebrow,
  title,
  intro,
  center = false,
  small = false,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
  small?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={`flex gap-8 ${center ? "flex-col items-center text-center" : "items-end justify-between"}`}>
      <div className={`flex flex-col gap-4 ${center ? "items-center" : ""}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={small ? "h2s" : "h2"}>{title}</h2>
        {intro && <p className={`intro ${center ? "max-w-[640px]" : "max-w-[560px]"}`}>{intro}</p>}
      </div>
      {action && <div className="shrink-0 pb-3">{action}</div>}
    </div>
  );
}
