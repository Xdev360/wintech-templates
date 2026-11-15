import { ImageResponse } from "next/og";
import { inkFor, safeAccent } from "@/lib/color";
import { readContent, templateFor } from "@/lib/site-model";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────────
   The picture that shows when a site's link is shared: WhatsApp,
   Instagram, X, Google. Drawn from the site's own words and colour, so
   it is right the moment they publish and changes when they do.
   ────────────────────────────────────────────────────────────── */

export const runtime = "nodejs";
const SIZE = { width: 1200, height: 630 };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let name = "A Wintech site";
  let headline = "";
  let accent = "#232732";
  let kind = "";

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sites")
      .select("name, template, content, published")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (data) {
      const c = readContent(data.content, data.template, data.name);
      name = c.brand.name;
      headline = c.hero.headline;
      accent = safeAccent(c.theme.accent);
      kind = templateFor(data.template).name;
    }
  }

  const ink = inkFor(accent);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: accent,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, opacity: 0.85 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: ink,
              color: accent,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
          {name}
        </div>

        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.08, letterSpacing: -2, fontWeight: 600 }}>
          {headline.slice(0, 110) || name}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, opacity: 0.8 }}>
          <span>{slug}.wintechstudio.com</span>
          <span>{kind}</span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        // Cheap to make, but there is no reason to make it twice a minute.
        "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
