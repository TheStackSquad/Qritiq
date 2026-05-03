//client/sessions/userSessions.js

import { create } from "zustand";
import Cookies from "js-cookie";

const COOKIE_ACCESS = "access_token";
const COOKIE_REFRESH = "refresh_token";
const COOKIE_USER = "kritiq_user";

const useAuthStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  user: null,
  accessToken: null,
  isHydrated: false,

  // ─── Computed ────────────────────────────────────────────
  isAuthenticated: () => !!get().accessToken && !!get().user,
  isCreator: () => ["creator", "pro", "admin"].includes(get().user?.role),
  isPro: () => ["pro", "admin"].includes(get().user?.role),

  // ─── Actions ─────────────────────────────────────────────

  // Called on app init — reads persisted session from cookies
  hydrate: () => {
    try {
      const token = Cookies.get(COOKIE_ACCESS);
      const raw = Cookies.get(COOKIE_USER);
      const user = raw ? JSON.parse(raw) : null;

      set({ user, accessToken: token || null, isHydrated: true });
    } catch {
      set({ user: null, accessToken: null, isHydrated: true });
    }
  },

  // Called after successful login or token refresh
  setSession: ({ access_token, refresh_token, expires_at, user }) => {
    const expiryDate = new Date(expires_at);
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);

    // Persist tokens in cookies (httpOnly would be better — use for prod)
    Cookies.set(COOKIE_ACCESS, access_token, {
      expires: expiryDate,
      sameSite: "Lax",
    });
    Cookies.set(COOKIE_REFRESH, refresh_token, {
      expires: refreshExpiry,
      sameSite: "Lax",
    });
    Cookies.set(COOKIE_USER, JSON.stringify(user), {
      expires: refreshExpiry,
      sameSite: "Lax",
    });

    set({ user, accessToken: access_token });
  },

  // Update access token after silent refresh (token rotation)
  updateAccessToken: (newToken, newExpiry) => {
    Cookies.set(COOKIE_ACCESS, newToken, {
      expires: new Date(newExpiry),
      sameSite: "Lax",
    });
    set({ accessToken: newToken });
  },

  // Called on logout or session expiry
  clearSession: () => {
    Cookies.remove(COOKIE_ACCESS);
    Cookies.remove(COOKIE_REFRESH);
    Cookies.remove(COOKIE_USER);
    set({ user: null, accessToken: null });
  },

  // Update user profile fields in place
  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    Cookies.set(COOKIE_USER, JSON.stringify(updated), {
      expires: 30,
      sameSite: "Lax",
    });
    set({ user: updated });
  },
}));

export default useAuthStore;