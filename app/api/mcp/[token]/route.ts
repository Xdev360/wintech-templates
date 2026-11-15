import { createClient } from "@supabase/supabase-js";
import { applyPatch, CONTENT_GUIDE, defaultContent, readContent, templateFor } from "@/lib/site-model";
import { normalizeSlug, slugError } from "@/lib/slugs";
import { getTemplate, TEMPLATES } from "@/lib/templates";

/* ──────────────────────────────────────────────────────────────
   Wintech for Claude: a remote MCP server.

   A person pastes https://app.wintechstudio.com/api/mcp/<their link>
   into Claude as a custom connector. Claude can then list, build, edit,
   and publish their Wintech sites from any conversation. The AI runs on
   their Claude plan, not on Wintech's key.

   Stateless Streamable HTTP: every request is one JSON-RPC message
   answered with JSON. The link in the URL is the credential; the
   database checks it on every call and acts only on its owner's sites.
   Everything written is cleaned by the same rules as the editor.
   ────────────────────────────────────────────────────────────── */

export const maxDuration = 30;

const VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "wintechstudio.com";

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

const TOOLS = [
  {
    name: "list_sites",
    description: "List the user's Wintech sites: id, name, link, template, and whether each is published.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_site",
    description: "Read one site's full content. Call this before update_site so changes build on what is there.",
    inputSchema: { type: "object", properties: { site_id: { type: "string" } }, required: ["site_id"], additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "list_templates",
    description: "List the Wintech templates a site can be built on, with what each is for.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "create_site",
    description: `Create a new site on a template. It starts hidden so the owner can check it before publishing. Pass "content" to write the site now; anything left out keeps the template's sample content.\n\n${CONTENT_GUIDE}`,
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Business name" },
        slug: { type: "string", description: "Web name: the site lives at <slug>.wintechstudio.com. Lowercase letters, numbers, hyphens." },
        template: { type: "string", enum: TEMPLATES.map((t) => t.id) },
        content: { type: "object", description: "Content, in the shape described above. Optional." },
      },
      required: ["name", "slug", "template"],
      additionalProperties: false,
    },
  },
  {
    name: "update_site",
    description: `Change a site's content. "changes" holds only the top-level keys being changed, each with its complete new value (to edit one product, send the whole "items" object). This can restructure the page: reorder or hide sections, add or remove items, questions, and figures. Changes go live immediately if the site is published, so confirm with the user first.\n\n${CONTENT_GUIDE}`,
    inputSchema: {
      type: "object",
      properties: { site_id: { type: "string" }, changes: { type: "object" } },
      required: ["site_id", "changes"],
      additionalProperties: false,
    },
    annotations: { destructiveHint: false },
  },
  {
    name: "set_published",
    description: "Publish a site (anyone with the link can see it) or hide it. Confirm with the user before publishing.",
    inputSchema: {
      type: "object",
      properties: { site_id: { type: "string" }, published: { type: "boolean" } },
      required: ["site_id", "published"],
      additionalProperties: false,
    },
  },
];

async function runTool(token: string, name: string, args: Record<string, unknown>) {
  const url = (slug: string) => `https://${slug}.${ROOT}`;
  switch (name) {
    case "list_sites": {
      const sites = await call<{ id: string; name: string; slug: string; template: string; published: boolean }[]>("mcp_list_sites", { p_token: token });
      return sites.map((s) => ({ ...s, url: url(s.slug), template_name: templateFor(s.template).name }));
    }
    case "get_site": {
      const s = await call<{ id: string; name: string; slug: string; template: string; published: boolean; content: unknown }>("mcp_get_site", { p_token: token, p_site: String(args.site_id || "") });
      return { ...s, url: url(s.slug), template_name: templateFor(s.template).name, content: readContent(s.content, s.template, s.name) };
    }
    case "list_templates":
      return TEMPLATES.map((t) => ({ id: t.id, name: t.name, kind: t.kind, description: t.blurb }));
    case "create_site": {
      const template = getTemplate(String(args.template || ""));
      if (!template) throw new Error("Unknown template. Call list_templates for the ids.");
      const name = String(args.name || "").trim().slice(0, 60);
      if (!name) throw new Error("Give the site a name.");
      const slug = normalizeSlug(String(args.slug || name));
      const bad = slugError(slug);
      if (bad) throw new Error(bad);
      const content = applyPatch(defaultContent(template), args.content ?? {});
      content.brand.name = name;
      const created = await call<{ id: string; slug: string }>("mcp_create_site", { p_token: token, p_name: name, p_slug: slug, p_template: template.id, p_content: content });
      return { ...created, url: url(created.slug), published: false, note: "Created hidden. Publish it with set_published once the owner is happy." };
    }
    case "update_site": {
      const siteId = String(args.site_id || "");
      const s = await call<{ template: string; name: string; content: unknown }>("mcp_get_site", { p_token: token, p_site: siteId });
      const next = applyPatch(readContent(s.content, s.template, s.name), args.changes ?? {});
      await call("mcp_save_site", { p_token: token, p_site: siteId, p_content: next });
      return { ok: true, content: next };
    }
    case "set_published": {
      const r = await call<{ ok: boolean; published: boolean }>("mcp_set_published", { p_token: token, p_site: String(args.site_id || ""), p_published: Boolean(args.published) });
      return r;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handle(token: string, msg: Rpc): Promise<object | null> {
  const id = msg.id ?? null;
  const reply = (result: object) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

  if (!msg.method) return fail(-32600, "Invalid request");
  if (msg.method.startsWith("notifications/")) return null;

  switch (msg.method) {
    case "initialize": {
      try {
        await call("mcp_whoami", { p_token: token });
      } catch (e) {
        return fail(-32001, e instanceof Error ? e.message : "This Wintech link is not valid.");
      }
      const asked = String(msg.params?.protocolVersion || "");
      return reply({
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[1],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "wintech-templates", title: "Wintech Templates", version: "1.0.0" },
        instructions:
          "Wintech Templates hosts small-business websites at <name>.wintechstudio.com. Use list_sites and get_site to see what the user has, list_templates to choose a design, create_site to build one, and update_site to change or restructure it. New sites start hidden; ask before publishing, and never invent prices, contact details, or testimonials.",
      });
    }
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      const name = String(msg.params?.name || "");
      const args = (msg.params?.arguments && typeof msg.params.arguments === "object" ? msg.params.arguments : {}) as Record<string, unknown>;
      try {
        const result = await runTool(token, name, args);
        return reply({ content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: Array.isArray(result) ? { items: result } : result });
      } catch (e) {
        // Tool failures are results the model can read and act on, not protocol errors.
        return reply({ content: [{ type: "text", text: e instanceof Error ? e.message : "That did not work." }], isError: true });
      }
    }
    default:
      return fail(-32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(token, m as Rpc)))).filter(Boolean);
    return out.length ? Response.json(out) : new Response(null, { status: 202 });
  }
  const out = await handle(token, body as Rpc);
  return out ? Response.json(out) : new Response(null, { status: 202 });
}

/* No server-to-client stream: every answer comes back on the POST. */
export function GET() {
  return new Response("Use POST. This is a stateless MCP endpoint.", { status: 405, headers: { Allow: "POST" } });
}
