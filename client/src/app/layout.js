// client/src/app/layout.js
import "./globals.css";
import localFont from "next/font/local";
import Header from "@/components/common/header/header";
import QueryProvider from "@/components/providers/queryProvider";
import ZustandProvider from "@/components/providers/zustandProvider";
import MobileMenu from "@/components/common/navbar/mobile/mobileMenu";
import MobileSearch from "@/components/common/navbar/mobile/mobileSearch";

const lexend = localFont({
  src: [
    {
      path: "../../public/fonts/Lexend-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lexend-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lexend-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lexend-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Lexend-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-lexend",
  display: "swap",
});

const clashGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/ClashGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashGrotesk-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash",
  display: "swap",
});

const dance = localFont({
  src: [
    { path: "../../public/fonts/Dance.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-dance",
  display: "swap",
  preload: false,
});

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://kritiq.app",
  ),
  title: {
    default: "KritiQ — Nigeria's Pulse on Film & Music",
    template: "%s | KritiQ",
  },
  description:
    "Rate upcoming Nollywood films and Afrobeats releases before they drop. KritiQ tracks the pre-release hype so producers know what the streets are saying.",
  keywords: [
    "Nollywood",
    "Afrobeats",
    "movie ratings",
    "Nigeria entertainment",
    "pre-release",
    "film review",
    "music review",
    "hype meter",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "KritiQ",
    title: "KritiQ — Nigeria's Pulse on Film & Music",
    description:
      "Rate upcoming Nollywood films and Afrobeats releases before they drop.",
    images: [
      {
        url: "/img/thumbnail_drgnimages.jpg",
        width: 1200,
        height: 630,
        alt: "KritiQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@KritiQapp",
    title: "KritiQ — Nigeria's Pulse on Film & Music",
    description:
      "Rate upcoming Nollywood films and Afrobeats releases before they drop.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/img/thumbnail_drgnimages.jpg" },
      { url: "/img/thumbnail_drgnimages.jpg", type: "image/jpg" },
    ],
    apple: "/img/thumbnail_drgnimages.jpg",
  },
  manifest: "/site.webmanifest",
};

// ─── Viewport ─────────────────────────────────────────────────────────────────
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C0001A",
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${clashGrotesk.variable} ${dance.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "KritiQ",
              url: "https://kritiq.app",
              description:
                "Nigeria's pulse on film and music — pre-release ratings platform",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://kritiq.app/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>

      <body className="bg-kritiq-black text-kritiq-white font-dance antialiased">
        <ZustandProvider>
          <QueryProvider>
            {/* ── Header — contains only the icon row on mobile ───────────── */}
            <Header />

            {/* ── Mobile drawers — siblings of Header, NOT children ──────────
                This is the architectural fix. Being outside <Header> means
                these components are outside the .glass backdrop-filter
                stacking context entirely. Their z-[9998]/z-[9999] values
                now compete at the document root level — nothing can trap them.
            ──────────────────────────────────────────────────────────────── */}
            <MobileMenu />
            <MobileSearch />

            {children}
          </QueryProvider>
        </ZustandProvider>
      </body>
    </html>
  );
}
