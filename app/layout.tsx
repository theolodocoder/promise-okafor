import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./stage.css";
import "./motion.css";
import { Motion } from "@/components/motion";
import { Frame } from "@/components/frame";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { FEEDS, ogImage } from "@/lib/seo";

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
  // each page sets its own canonical; the layout only advertises the feeds (a page's alternates replace these)
  alternates: { types: FEEDS },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
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
  // fallback share card for pages without their own (the 404); every real page sets its own through shareMetadata
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    images: [{ url: ogImage("/"), width: 1200, height: 630, alt: "Promise Okafor, Lead Frontend Engineer in Lagos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: ogImage("/"), alt: "Promise Okafor, Lead Frontend Engineer in Lagos" }],
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
