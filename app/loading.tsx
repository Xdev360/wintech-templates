/* Shown while a page is on its way (Figma "00 · v5 changes", Skeletons).
   Grey blocks in the shape of the page with a slow shimmer, never a blank
   screen or a spinner that makes a fast page feel slow. */
export default function Loading() {
  return (
    <div className="v4 min-h-screen" aria-busy="true" aria-label="Loading">
      <div className="h-8 bg-[#111]" />
      <div className="border-b border-[var(--v4-line)]">
        <div className="wrap flex h-[74px] items-center justify-between">
          <span className="skel h-5 w-40" />
          <span className="flex gap-6 max-lg:hidden">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="skel h-3.5 w-16" />)}</span>
          <span className="skel h-9 w-28" />
        </div>
      </div>
      <div className="wrap flex flex-col items-center gap-5 pt-[88px]">
        <span className="skel h-3 w-56" />
        <span className="skel h-12 w-[min(620px,90%)]" />
        <span className="skel h-12 w-[min(460px,70%)]" />
        <span className="skel mt-2 h-4 w-[min(540px,85%)]" />
        <span className="skel mt-4 h-11 w-[min(520px,90%)]" />
        <span className="skel mt-12 h-[420px] w-full" />
      </div>
    </div>
  );
}
