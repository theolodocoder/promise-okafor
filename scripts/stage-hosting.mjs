import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const out = resolve(root, "out");

if (!dist.startsWith(root) || !out.startsWith(root)) {
  throw new Error("Unsafe staging path");
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(resolve(dist, "server"), { recursive: true });
cpSync(out, resolve(dist, "client"), { recursive: true });

writeFileSync(
  resolve(dist, "server", "index.js"),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404 && !url.pathname.includes(".")) {
      const clean = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
      response = await env.ASSETS.fetch(new Request(new URL(clean, url), request));
    }

    return response;
  }
};
`,
);
