export type Theme = "light" | "dark";
export const THEME_KEY = "theme";

export function resolveTheme(stored: string | null, systemDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}

// Runs in <head> before first paint, so it repeats the resolveTheme rule inline.
// Safety net: if Motion has not marked <html> with "m" within 3s, "shown" lifts every hidden start state in motion.css.
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,s=null;try{s=localStorage.getItem("${THEME_KEY}")}catch(e){}var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;d.classList.add("js");setTimeout(function(){d.classList.contains("m")||d.classList.add("shown")},3000)})();`;
