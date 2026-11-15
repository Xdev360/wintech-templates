import Link from "next/link";
import { Inbox, Monitor } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Some screens are not for a phone.

   Editing a website on a 390px screen is a bad experience however it
   is built: you cannot see the page you are changing. So on a phone
   these screens say so and point at the two things that do belong
   there — reading messages and basic settings — instead of shipping a
   cramped editor and hoping.

   It is CSS, not a redirect: rotate to a tablet or open a laptop and
   the real screen is already there.
   ────────────────────────────────────────────────────────────── */

export function DesktopOnly({
  what,
  base,
  children,
}: {
  what: string;
  base: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden">
        <div className="rounded-[13px] p-5 text-center shadow-[0_0_0_1px_var(--line)]">
          <span className="mx-auto grid h-9 w-9 place-items-center rounded-[10px] bg-accent-3/40 text-accent">
            <Monitor className="h-4 w-4" />
          </span>
          <p className="mt-3 text-[14px] font-medium">{what} needs a bigger screen</p>
          <p className="mx-auto mt-1 max-w-[40ch] text-[12.5px] leading-[1.55] text-mute">
            You cannot see the page you are changing on a phone. Open this on a computer and the
            whole editor is here.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href={`${base}/inbox`} className="btn-primary">
              <Inbox className="h-4 w-4" /> Read messages
            </Link>
            <Link href={`${base}/settings`} className="btn-soft">Site settings</Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
