//client/components/common/header/header.js

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import DesktopNav from "@/components/common/navbar/desktop/desktopNav";
import MobileNav from "@/components/common/navbar/mobile/mobileNav";
import { NAV_LINKS } from "../navbar/desktop/navLinks";

export default function Header() {
  const pathname = usePathname();

  const getPageTitle = (path) => {
    if (path === "/") return "KritiQ";

    for (const link of NAV_LINKS) {
      if (path.startsWith(link.href)) {
        return link.label;
      }
    }
    return "KritiQ"; // Default title if no match
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className="glass fixed top-0 left-0 right-0 z-30 h-16"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
          aria-label="KritiQ — home"
        >
          {/* Wordmark — Clash Grotesk bold */}
          <span
            className="font-clash font-bold text-xl tracking-tight"
            style={{
              background: "linear-gradient(135deg, #E8001F, #FF4433)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            KritiQ
          </span>

          {/* Beta pill — removes before investor pitch if desired */}
          <span
            className="hidden sm:inline-flex text-[10px] font-lexend font-semibold
                       px-1.5 py-0.5 rounded-badge border align-middle"
            style={{
              color: "var(--color-kritiq-ember)",
              borderColor: "rgba(255,68,51,0.3)",
              background: "rgba(255,68,51,0.08)",
            }}
          >
            BETA
          </span>
        </Link>

        {/* ── Dynamic Page Title ──────────────────────────────── */} 
        <span className="font-clash font-semibold text-xl text-kritiq-white mx-4 hidden sm:block">
          {pageTitle}
        </span>

        {/* ── Desktop Nav ──────────────────────────────────── */}
        <DesktopNav currentPath={pathname} />

        {/* ── Mobile Nav (icons only — drawer inside component) */}
        <MobileNav currentPath={pathname} />
      </div>

      {/* Bottom red accent line — 1px cinematic brand marker */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(192,0,26,0.5), transparent)",
        }}
      />
    </header>
  );
}
