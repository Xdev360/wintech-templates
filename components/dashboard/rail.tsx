"use client";

import { createContext, useContext } from "react";

/* Whether the sidebar is folded down to icons. Set once by the frame,
   read by every item in it, so nothing has to pass it along by hand. */
export const RailContext = createContext(false);

export function useRail() {
  return useContext(RailContext);
}
