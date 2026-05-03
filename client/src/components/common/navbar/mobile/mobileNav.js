// client/src/components/common/navbar/mobile/mobileNav.js
"use client";

import { Search, X, Menu, User } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/sessions/userSessions";
import useUIStore from "@/sessions/uiStore";

// ── This component is now just the icon row in the header ─────────────────────
// MobileMenu and MobileSearch are rendered in layout.js as siblings of <Header>
// so they live completely outside the header's backdrop-filter stacking context.

export default function MobileNav() {
  const { user, isAuthenticated } = useAuthStore();
  const { menuOpen, toggleMenu, openSearch } = useUIStore();
  const isAuth = isAuthenticated();

  return (
    <div className="flex md:hidden items-center gap-1">
      <button
        onClick={openSearch}
        className="btn-icon"
        aria-label="Open search"
      >
        <Search size={18} />
      </button>

      <button
        onClick={toggleMenu}
        className="btn-icon"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isAuth ? (
        <Link href="/profile" className="btn-icon" aria-label="Profile">
          <div className="w-7 h-7 rounded-full bg-kritiq-dark-2 border border-kritiq-dark-3 flex items-center justify-center text-[10px] font-bold text-kritiq-silver uppercase overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              user?.username?.[0] || "?"
            )}
          </div>
        </Link>
      ) : (
        <Link href="/login" className="btn-icon" aria-label="Sign in">
          <User size={18} />
        </Link>
      )}
    </div>
  );
}
