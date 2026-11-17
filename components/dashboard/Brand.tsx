import Link from "next/link";
import { Mark } from "@/components/v4/ui";

/* The Wintech Templates lockup at the top of the sidebar; the mark alone when it is folded. */

export function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2 text-[17px] tracking-[-0.02em]">
      <Mark className="h-[15px] w-[22px]" />
      <span className="truncate font-semibold text-[#0b1638]">Wintech <span className="font-medium text-[#8a93a6]">Templates</span></span>
    </Link>
  );
}

export function BrandMarkLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="Wintech home" className="grid h-8 w-8 place-items-center">
      <Mark className="h-[15px] w-[22px]" />
    </Link>
  );
}
