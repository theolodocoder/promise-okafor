import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Promise Okafor — Senior Frontend Engineer",
    short_name: "Promise Okafor",
    description: "Frontend engineering portfolio and field notes by Promise Okafor.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1eadf",
    theme_color: "#f1eadf",
    lang: "en",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
