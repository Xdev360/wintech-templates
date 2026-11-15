import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { inkFor, safeAccent } from "@/lib/color";
import { naira } from "@/lib/money";
import { readContent } from "@/lib/site-model";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────────
   A receipt as a picture, in the shop's own colours.

   A picture because of how a receipt is really used here: forwarded on
   WhatsApp, kept in the phone's gallery, shown to a delivery rider. A
   PDF does none of that well on a phone.

   Two things this drawing engine is strict about, both learned the
   hard way:
     · every element holding more than one child needs an explicit
       display, so text is built into single strings before it is drawn;
     · it can only draw characters the given font actually has. The
       bundled Inter carries ₦; the engine's default font does not, and
       silently fails the whole image over one glyph.
   ────────────────────────────────────────────────────────────── */

export const runtime = "nodejs";

type Order = {
  found: boolean;
  reference?: string;
  status?: string;
  items?: { title: string; qty: number; price_kobo: number }[];
  total_kobo?: number;
  customer_name?: string;
  customer_phone?: string;
  confirmed_at?: string | null;
  created_at?: string;
  business?: string;
  slug?: string;
  business_phone?: string | null;
};

const font = (file: string) => readFile(path.join(process.cwd(), "assets", "fonts", file));

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!supabaseConfigured()) return new Response("Not available", { status: 503 });

  const supabase = await createClient();
  const { data } = await supabase.rpc("order_status", { p_reference: reference.toUpperCase().slice(0, 16) });
  const order = (data || { found: false }) as Order;
  if (!order.found) return new Response("No such order", { status: 404 });

  // The shop's own colours, read from its published site.
  let accent = "#232732";
  let logo = "";
  if (order.slug) {
    const { data: site } = await supabase.from("sites").select("name, template, content").eq("slug", order.slug).maybeSingle();
    if (site) {
      const c = readContent(site.content, site.template, site.name);
      accent = safeAccent(c.theme.accent);
      logo = c.brand.logoUrl || "";
    }
  }

  const [regular, semibold] = await Promise.all([font("Inter-Regular.ttf"), font("Inter-SemiBold.ttf")]);
  const ink = inkFor(accent);
  const paid = order.status === "confirmed";
  const items = (order.items || []).slice(0, 8);
  const more = (order.items || []).length - items.length;
  const when = new Date(order.confirmed_at || order.created_at || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  // The picture is as tall as the order needs, so a one-item receipt is
  // not mostly empty paper.
  const height = Math.min(1560, 668 + items.length * 74 + (more > 0 ? 44 : 0));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff", fontFamily: "Inter" }}>
        {/* The band carries the shop's colour, so the receipt is theirs. */}
        <div style={{ display: "flex", alignItems: "center", padding: "46px 56px", background: accent, color: ink }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={76} height={76} alt="" style={{ borderRadius: 20, objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 76, height: 76, borderRadius: 20, background: ink, color: accent, fontSize: 36, fontWeight: 600 }}>
              {(order.business || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 22 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>{(order.business || "").slice(0, 24)}</div>
            <div style={{ display: "flex", fontSize: 21, opacity: 0.82 }}>{`${order.slug}.wintechstudio.com`}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: "auto", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 19, letterSpacing: 3, opacity: 0.8 }}>{paid ? "RECEIPT" : "ORDER"}</div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>{order.reference}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "42px 56px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: "#8b93a1" }}>BILLED TO</div>
              <div style={{ display: "flex", fontSize: 28, color: "#0a0a0a", marginTop: 8 }}>{(order.customer_name || "").slice(0, 24)}</div>
              <div style={{ display: "flex", fontSize: 23, color: "#6b7280", marginTop: 4 }}>{order.customer_phone}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: "#8b93a1" }}>DATE</div>
              <div style={{ display: "flex", fontSize: 28, color: "#0a0a0a", marginTop: 8 }}>{when}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 42 }}>
            {items.map((it) => (
              <div key={it.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "21px 0", borderBottom: "1px solid #eceef1" }}>
                <div style={{ display: "flex", fontSize: 26, color: "#0a0a0a" }}>{`${it.qty} × ${it.title.slice(0, 28)}`}</div>
                <div style={{ display: "flex", fontSize: 26, color: "#0a0a0a" }}>{naira(it.price_kobo * it.qty)}</div>
              </div>
            ))}
            {more > 0 ? (
              <div style={{ display: "flex", fontSize: 23, color: "#6b7280", paddingTop: 18 }}>{`and ${more} more`}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 38 }}>
            <div style={{ display: "flex", fontSize: 26, color: "#6b7280" }}>{paid ? "Total paid" : "Total due"}</div>
            <div style={{ display: "flex", fontSize: 60, fontWeight: 600, letterSpacing: -2, color: "#0a0a0a" }}>{naira(order.total_kobo || 0)}</div>
          </div>

          <div style={{ display: "flex", marginTop: 32 }}>
            <div style={{ display: "flex", padding: "12px 24px", borderRadius: 999, background: paid ? "#e9f9f1" : "#fff4e6", color: paid ? "#046c4e" : "#9a5b06", fontSize: 24, fontWeight: 600 }}>
              {paid ? "Paid · confirmed by the seller" : "Not paid yet"}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 34, borderTop: "1px solid #eceef1" }}>
            <div style={{ display: "flex", fontSize: 21, color: "#9099a8" }}>
              {order.business_phone ? `Bank transfer · ${order.business_phone}` : "Paid by bank transfer"}
            </div>
            <div style={{ display: "flex", fontSize: 21, color: "#9099a8" }}>Made with Wintech</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1000,
      height,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
      ],
      headers: {
        // The point of the button is that it lands in the phone's downloads.
        "content-disposition": `attachment; filename="${order.reference}-receipt.png"`,
        "cache-control": "private, max-age=60",
      },
    },
  );
}
