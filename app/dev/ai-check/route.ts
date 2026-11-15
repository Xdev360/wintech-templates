import { aiCheck } from "@/lib/ai";

/* DEVELOPMENT ONLY. Open /dev/ai-check in a browser and it tells you
   whether Wintech AI can reach Anthropic with the key on this machine.
   It never shows the key. 404 in production. */
export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const result = await aiCheck();
  return Response.json(result, { status: result.ok ? 200 : 503 });
}
