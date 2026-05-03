//client/components/providers/zustandProvider.js

"use client";

import { useEffect } from "react";
import useAuthStore from "@/sessions/userSessions";

export default function ZustandProvider({ children }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const updateAccessToken = useAuthStore((s) => s.updateAccessToken);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    // Hydrate auth state from cookies on first render
    hydrate();

    // Listen for silent token refresh (fired by tokenRefresh interceptor)
    const onRefreshed = (e) => {
      updateAccessToken(e.detail.access_token, e.detail.expires_at);
    };

    // Listen for session expiry (fired when refresh token is invalid)
    const onExpired = () => {
      clearSession();
      window.location.href = "/";
    };

    window.addEventListener("kritiq:token-refreshed", onRefreshed);
    window.addEventListener("kritiq:session-expired", onExpired);

    return () => {
      window.removeEventListener("kritiq:token-refreshed", onRefreshed);
      window.removeEventListener("kritiq:session-expired", onExpired);
    };
  }, [hydrate, updateAccessToken, clearSession]);

  return <>{children}</>;
}