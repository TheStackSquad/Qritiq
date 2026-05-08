// client/src/components/common/navbar/mobile/mobileMenu.js
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ChevronRight,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import useAuthStore from "../../../../sessions/userSessions";
import useUIStore from "../../../../sessions/uiStore";
import { useLogout } from "../../../../utils/hooks/useKritiQ";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { label: "Movies", href: "/movies" },
  { label: "Music", href: "/music" },
  { label: "Trending", href: "/trending" },
  { label: "Top Rated", href: "/top-rated" },
];

// ── Rendered in layout.js as a sibling of <Header> ───────────────────────────
// This means it is completely outside the header's backdrop-filter stacking
// context — no portal needed, no z-index fighting.

export default function MobileMenu() {
  const { user, isAuthenticated, isCreator } = useAuthStore();
  const { menuOpen, closeMenu, closeAll } = useUIStore();
  const logout = useLogout();
  const currentPath = usePathname();

useEffect(() => {
  if (typeof document === "undefined") return;

  if (menuOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  // Cleanup function: resets scroll if the component unmounts while menu is open
  return () => {
    document.body.style.overflow = "";
  };
}, [menuOpen]);

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────────
          Lives on the document root stacking context — no header ancestor
          with backdrop-filter to trap it.
          z-[9998] clears every page element comfortably.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={clsx(
          "fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm md:hidden",
          "transition-opacity duration-300",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Drawer ──────────────────────────────────────────────────────────
          translate-x-full  → off-screen right  (closed)
          translate-x-0     → in view           (open)
          GPU compositor transition — no layout recalc, works on open + close.
          invisible delay-300 removes it from the a11y tree after exit animation.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        className={clsx(
          "fixed top-0 right-0 h-full w-[80vw] max-w-xs",
          "flex flex-col md:hidden",
          "z-[9999]",
          "bg-kritiq-dark-1 border-l border-kritiq-dark-3",
          "transition-transform duration-300 ease-in-out",
          menuOpen
            ? "translate-x-0 visible"
            : "translate-x-full invisible delay-300",
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-kritiq-dark-3">
          <span className="font-clash font-bold text-lg text-kritiq-white">
            Menu
          </span>
          <button
            onClick={closeMenu}
            className="btn-icon"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Auth user row */}
        {isAuthenticated() && (
          <div className="flex items-center gap-3 px-5 py-4 bg-kritiq-dark-2/50 border-b border-kritiq-dark-3">
            <div className="w-10 h-10 rounded-full bg-kritiq-dark-3 flex items-center justify-center text-sm font-bold text-kritiq-silver">
              {user?.username?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-kritiq-white truncate">
                {user?.username}
              </p>
              <p className="text-[10px] text-kritiq-ash truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
              className={clsx(
                "flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium",
                currentPath === link.href
                  ? "bg-kritiq-red/10 text-kritiq-red"
                  : "text-kritiq-silver",
              )}
            >
              {link.label}
              <ChevronRight size={14} />
            </Link>
          ))}

          <div className="h-px bg-kritiq-dark-3 my-4" />

          {isAuthenticated() ? (
            <>
              <Link
                href="/profile"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="flex items-center gap-3 px-4 py-3 text-sm text-kritiq-silver"
              >
                <Settings size={16} /> Settings
              </Link>

              {isCreator() && (
                <Link
                  href="/pro/dashboard"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-kritiq-ember"
                >
                  <LayoutDashboard size={16} /> Partner Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  logout.mutate();
                  closeAll();
                }}
                tabIndex={menuOpen ? 0 : -1}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-kritiq-silver"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="p-2 space-y-2">
              <Link
                href="/login"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="btn-primary w-full justify-center py-3"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="btn-ghost w-full justify-center py-3"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
