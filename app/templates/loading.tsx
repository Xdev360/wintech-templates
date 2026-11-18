/* Templates library loading: card skeletons in the grid. */
export default function Loading() {
  return (
    <div className="v4 min-h-screen" aria-busy="true" aria-label="Loading templates">
      <div className="h-8 bg-[#111]" />
      <div className="border-b border-[var(--v4-line)]"><div className="wrap flex h-[74px] items-center"><span className="skel h-5 w-40" /></div></div>
      <div className="wrap pt-20">
        <span className="skel block h-3 w-24" />
        <span className="skel mt-5 block h-12 w-[min(520px,90%)]" />
        <span className="skel mt-5 block h-4 w-[min(600px,90%)]" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="hair flex flex-col gap-3 p-2 pb-4">
              <span className="skel h-[240px] w-full" />
              <span className="skel mx-2 h-4 w-40" />
              <span className="skel mx-2 h-3 w-56" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
