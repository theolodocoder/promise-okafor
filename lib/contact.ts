const lagos = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function lagosTime(date: Date): string {
  return lagos.format(date);
}

export async function copyEmail(clipboard: { writeText(text: string): Promise<void> } | undefined, email: string): Promise<"copied" | "mailto"> {
  if (!clipboard) return "mailto";
  try {
    await clipboard.writeText(email);
    return "copied";
  } catch {
    return "mailto";
  }
}
