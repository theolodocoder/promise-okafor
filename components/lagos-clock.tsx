"use client";

import { useSyncExternalStore } from "react";
import { lagosTime } from "@/lib/contact";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 15000);
  return () => clearInterval(id);
};

// "--:--" on the server and first paint, then the time in Lagos.
export function LagosClock() {
  const time = useSyncExternalStore(subscribe, () => lagosTime(new Date()), () => "--:--");
  return <span>{time}</span>;
}
