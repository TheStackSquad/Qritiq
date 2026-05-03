// client/middleware/withAuth.js
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/sessions/userSessions";

const ROLE_HIERARCHY = {
  guest: 0,
  user: 1,
  creator: 2,
  pro: 3,
  admin: 99,
};

export default function withAuth(WrappedComponent, options = {}) {
  const { requiredRole = "user" } = options;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 1;

  function AuthGuard(props) {
    const router = useRouter();
    const pathname = usePathname();
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);

    const isAuth = isAuthenticated();
    const roleLevel = ROLE_HIERARCHY[user?.role] ?? 0;
    const hasRole = roleLevel >= requiredLevel;

    useEffect(() => {
      if (!isHydrated) return;

      if (!isAuth) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!hasRole) {
        // Authenticated but wrong role — redirect home
        // In a future version: show upgrade modal instead
        router.replace("/");
      }
    }, [isHydrated, isAuth, hasRole, router, pathname]);

    // ── Loading state — prevents flash of protected content ──
    if (!isHydrated) {
      return <AuthLoader />;
    }

    // ── Not authenticated or wrong role — redirect in progress ──
    if (!isAuth || !hasRole) {
      return <AuthLoader />;
    }

    return <WrappedComponent {...props} />;
  }

  // Preserve display name for React DevTools
  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return AuthGuard;
}

// ── Full-screen loader shown during auth check ────────────────────
function AuthLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-kritiq-black)",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Spinning KritiQ logo */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid var(--color-kritiq-dark-3)",
          borderTopColor: "var(--color-kritiq-red)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          fontFamily: "var(--font-lexend)",
          fontSize: "13px",
          color: "var(--color-kritiq-ash)",
        }}
      >
        Verifying access...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
