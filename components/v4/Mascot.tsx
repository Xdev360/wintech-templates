"use client";

import { useId } from "react";

/* Wintech AI mascot (Figma page 24 "Wintech AI mascot", five eye states).
   The eyes slide when looking left or right, so state changes animate. */

export type Eyes = "open" | "left" | "right" | "shut" | "happy";

const BODY =
  "M12 3H36C37.3132 3 38.6136 3.25866 39.8269 3.7612C41.0401 4.26375 42.1425 5.00035 43.0711 5.92895C43.9997 6.8575 44.7363 7.9599 45.2388 9.17315C45.7414 10.3864 46 11.6868 46 13V25C46 26.3132 45.7414 27.6136 45.2388 28.8269C44.7363 30.0401 43.9997 31.1425 43.0711 32.071C42.1425 32.9996 41.0401 33.7362 39.8269 34.2388C38.6136 34.7414 37.3132 35 36 35H15L8.4 39.4C8.29325 39.4745 8.16785 39.5177 8.0379 39.5248C7.90795 39.5319 7.7786 39.5028 7.6643 39.4404C7.55005 39.3781 7.45545 39.2852 7.3911 39.172C7.32675 39.0589 7.2952 38.93 7.3 38.8V34.2C5.64195 33.3188 4.26548 31.9885 3.32817 30.3615C2.39087 28.7344 1.93058 26.8764 2 25V13C2 10.3478 3.05357 7.8043 4.92893 5.92895C6.8043 4.05357 9.34785 3 12 3Z";
const EYE_L = "M18.8785 12.8238C18.5712 11.5913 17.3229 10.8413 16.0904 11.1486C14.8578 11.4559 14.1078 12.7041 14.4151 13.9367L15.7215 19.1763C16.0288 20.4088 17.2771 21.1588 18.5096 20.8515C19.7421 20.5442 20.4921 19.2959 20.1848 18.0634L18.8785 12.8238Z";
const EYE_R = "M33.5848 13.9366C33.8922 12.7041 33.1421 11.4558 31.9096 11.1485C30.6771 10.8412 29.4288 11.5912 29.1215 12.8238L27.8151 18.0634C27.5078 19.2959 28.2578 20.5442 29.4904 20.8515C30.7229 21.1588 31.9712 20.4087 32.2785 19.1762L33.5848 13.9366Z";
const W = "#F4F6FA";

export function Mascot({ eyes = "open", size = 48, className = "" }: { eyes?: Eyes; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const dx = eyes === "left" ? -6.5 : eyes === "right" ? 6.5 : 0;
  const round = eyes === "open" || eyes === "left" || eyes === "right";
  return (
    <svg width={size} height={(size * 44) / 48} viewBox="0 0 48 44" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`a${id}`} x1="2" y1="3" x2="37.9" y2="46.25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E2A44" />
          <stop offset="1" stopColor="#0A0E17" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="2" y1="3" x2="2" y2="39.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={BODY} fill={`url(#a${id})`} />
      <path d={BODY} fill={`url(#b${id})`} />
      {round ? (
        <g style={{ transform: `translateX(${dx}px)`, transition: "transform 160ms ease-out" }}>
          <path d={EYE_L} fill={W} />
          <path d={EYE_R} fill={W} />
        </g>
      ) : eyes === "shut" ? (
        <path d="M14.5 16C16.1667 18 17.8333 18 19.5 16M28.5 16C30.1667 18 31.8333 18 33.5 16" stroke={W} strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <path d="M14.5 18C16.1667 14.6667 17.8333 14.6667 19.5 18M28.5 18C30.1667 14.6667 31.8333 14.6667 33.5 18" stroke={W} strokeWidth="2.2" strokeLinecap="round" />
      )}
      {eyes === "happy" ? (
        <path d="M20 24.5C22.6667 27.5 25.3333 27.5 28 24.5" stroke={W} strokeWidth="2" strokeLinecap="round" />
      ) : eyes === "shut" ? (
        <path d="M22 26H26" stroke={W} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M21 25.5L24 27.9L27 25.5" stroke={W} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Mascot with a speech bubble; the text fades when it changes. */
export function MascotSays({ eyes, text }: { eyes: Eyes; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mascot-bob" key={eyes}><Mascot eyes={eyes} size={44} /></span>
      <p key={text} className="mascot-say rounded-[2px] bg-[#f3f4f6] px-3 py-2 text-[14px] leading-5 text-[#0a0e17]" aria-live="polite">{text}</p>
    </div>
  );
}
