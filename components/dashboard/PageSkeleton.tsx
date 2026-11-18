/* Dashboard page loading (Figma "00 · v5 changes", Skeletons): the
   sidebar and top bar stay, the page area shows grey blocks. */
export function PageSkeleton() {
  return (
    <div className="v4 flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <span className="skel h-7 w-64" />
        <span className="skel h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="hair flex flex-col gap-3 bg-white p-5">
            <span className="skel h-3 w-20" /><span className="skel h-7 w-28" /><span className="skel h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="hair flex flex-col gap-3 bg-white p-5">
          <span className="skel h-5 w-40" />
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="skel h-10 w-full" />)}
        </div>
        <div className="hair flex flex-col gap-3 bg-white p-5">
          <span className="skel h-5 w-28" />
          {[0, 1, 2].map((i) => <span key={i} className="skel h-12 w-full" />)}
        </div>
      </div>
    </div>
  );
}
