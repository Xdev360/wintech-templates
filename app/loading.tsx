/* Shown while a page is on its way. Quiet on purpose: a spinner that
   shouts makes a fast page feel slow. */
export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-page">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-2 border-t-accent" aria-label="Loading" />
    </div>
  );
}
