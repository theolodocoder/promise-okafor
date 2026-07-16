import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif";
import "./globals.css";
import { MotionLayer } from "@/components/motion-layer";

export const metadata: Metadata = {
  metadataBase: new URL("https://promiseokafor.dev"),
  title: {
    default: "Promise Okafor — Senior Frontend Engineer",
    template: "%s — Promise Okafor",
  },
  description:
    "Senior frontend engineer building high-performance product systems with React, Next.js and TypeScript.",
  keywords: [
    "Promise Okafor",
    "Senior Frontend Engineer",
    "Staff Frontend Engineer",
    "React",
    "Next.js",
    "TypeScript",
    "Frontend Architecture",
  ],
  openGraph: {
    title: "Promise Okafor — Senior Frontend Engineer",
    description: "Product instinct. Systems thinking. Craft without theatre.",
    type: "website",
    images: [{ url: "/og.png", alt: "Promise Okafor, Senior Frontend Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promise Okafor — Senior Frontend Engineer",
    description: "Product instinct. Systems thinking. Craft without theatre.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body id="top">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <MotionLayer />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
