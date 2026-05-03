//client/src/components/common/navbar/userProfile.js

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import useAuthStore from "@/sessions/userSessions";
import { useLogout } from "@/utils/hooks/useKritiQ";
import { getAvatarUrl } from "@/services/cloudinary/upload/urlBuilders";

export default function UserProfile() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, isAuthenticated, isCreator } = useAuthStore();
  const logout = useLogout();

  const isAuth = isAuthenticated();
  const creator = isCreator();

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isAuth) {
    return (
      <Link href="/login" className="btn-ghost text-sm px-4 py-2">
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setProfileOpen((v) => !v)}
        className="btn-icon relative"
      >
        {user?.avatar_url ? (
          <img
            src={getAvatarUrl(user.avatar_url, 32)}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-kritiq-dark-3"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-kritiq-dark-2 border border-kritiq-dark-3 flex items-center justify-center text-xs font-lexend font-semibold text-kritiq-silver uppercase">
            {user?.username?.[0] || "?"}
          </div>
        )}
      </button>

      {profileOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-kritiq-dark-1 border border-kritiq-dark-3 rounded-card shadow-card z-50 overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-kritiq-dark-3">
            <p className="text-sm font-lexend font-semibold text-kritiq-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-kritiq-ash truncate">{user?.email}</p>
          </div>
          <ul className="py-1">
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-kritiq-silver font-gilroy hover:bg-kritiq-dark-2 hover:text-kritiq-white"
              >
                <Settings size={14} /> Profile Settings
              </Link>
            </li>
            {creator && (
              <li>
                <Link
                  href="/pro/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-kritiq-ember font-gilroy hover:bg-kritiq-dark-2"
                >
                  <LayoutDashboard size={14} /> Partner Dashboard
                </Link>
              </li>
            )}
            <li className="border-t border-kritiq-dark-3 mt-1 pt-1">
              <button
                onClick={() => logout.mutate()}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-kritiq-silver font-gilroy hover:bg-kritiq-dark-2 hover:text-kritiq-white"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}