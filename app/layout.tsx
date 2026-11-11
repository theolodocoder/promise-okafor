import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./stage.css";
import "./motion.css";
import { Motion } from "@/components/motion";
import { Frame } from "@/components/frame";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { absoluteUrl, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

// Fonts live in the repo (latin subsets from Google Fonts, both OFL) so the build does not depend on the network.
const figtree = localFont({ src: "./fonts/figtree-latin.woff2", weight: "400 600", style: "normal", variable: "--font-figtree", display: "swap" });
const serif = localFont({ src: "./fonts/instrument-serif-italic-latin.woff2", weight: "400", style: "italic", variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": absoluteUrl("/blog/rss.xml") },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "Promise Okafor",
    "Lead Frontend Engineer",
    "Senior Frontend Engineer",
    "React",
    "Angular",
    "Next.js",
    "TypeScript",
    "Mobile Development",
    "Desktop Applications",
    "Frontend Architecture",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_NG",
    images: [{ url: OG_IMAGE, width: 1732, height: 909, alt: "Promise Okafor, frontend systems and product engineering" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7F9" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body id="top">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Frame>{children}</Frame>
        <Motion />
      </body>
    </html>
  );
}
