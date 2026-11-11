"use client";

import { useState } from "react";
import { copyEmail } from "@/lib/contact";
import { EMAIL } from "@/lib/site";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    if ((await copyEmail(navigator.clipboard, EMAIL)) === "mailto") {
      location.href = "mailto:" + EMAIL;
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return <button type="button" className="btn ghost" onClick={onClick}><span aria-live="polite">{copied ? "Copied" : "Copy my email"}</span></button>;
}
