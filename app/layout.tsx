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
    "Senior frontend engineer building high-performance product systems across web, mobile and desktop with Angular, React, Next.js and TypeScript.",
  keywords: [
    "Promise Okafor",
    "Senior Frontend Engineer",
    "Staff Frontend Engineer",
    "React",
    "Angular",
    "Next.js",
    "TypeScript",
    "Mobile Development",
    "Desktop Applications",
    "Frontend Architecture",
  ],
  openGraph: {
    title: "Promise Okafor — Senior Frontend Engineer",
    description: "Product instinct. Systems thinking. Craft without theatre.",
    type: "website",
    images: [{ url: "/og-blog.png", alt: "Promise Okafor — Field Notes on frontend systems and product engineering" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promise Okafor — Senior Frontend Engineer",
    description: "Product instinct. Systems thinking. Craft without theatre.",
    images: ["/og-blog.png"],
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
