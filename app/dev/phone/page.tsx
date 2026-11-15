import { notFound } from "next/navigation";

/* DEVELOPMENT ONLY. A real phone-width viewport on a desktop screen, so
   mobile bugs can be seen and measured instead of guessed at. Headless
   browsers clamp their window to 500px, which hid these for weeks. */
export default async function DevPhone({ searchParams }: { searchParams: Promise<{ at?: string; w?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { at = "/", w = "390" } = await searchParams;
  const width = Math.min(Math.max(Number(w) || 390, 320), 1600);
  return (
    <div style={{ background: "#1b1d21", minHeight: "100vh", padding: 16 }}>
      <iframe
        id="phone"
        src={at}
        style={{ width, height: 3000, border: 0, display: "block", background: "#fff" }}
      />
    </div>
  );
}
