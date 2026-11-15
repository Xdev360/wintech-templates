import Link from "next/link";
import { Mark } from "@/components/shell/Mark";

/* The Wintech mark in the top bar: with its name when the sidebar is
   open, on its own when it is folded. Both go home. */

export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2 text-[14px] font-semibold tracking-[-0.02em]">
      <Mark className="h-[15px] w-auto" />
      <span className="truncate">Wintech</span>
    </Link>
  );
}

export function BrandMarkLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Wintech home" className="grid h-8 w-8 place-items-center">
      <Mark className="h-[14px] w-auto" />
    </Link>
  );
}
