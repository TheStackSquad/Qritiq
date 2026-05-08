"use client";
//client/utils/hooks/useAuth.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAPI, signupAPI, logoutAPI } from "../../services";
import useAuthStore from "../../sessions/userSessions";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => setSession(data),
  });
}

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: signupAPI,
    onSuccess: (data) => setSession(data),
  });
}

export function useLogout() {
  const { clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refresh = typeof document !== "undefined"
          ? document.cookie.match(/refresh_token=([^;]+)/)?.[1]
          : "";
      return logoutAPI(refresh);
    },
    onSettled: () => {
      clearSession();
      queryClient.clear(); 
    },
  });
}