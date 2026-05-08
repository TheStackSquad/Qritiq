"use client";
//client/utils/hooks/useDashboard.js

import { useQuery } from "@tanstack/react-query";
import api from "../../apiClient/tokenRefresh";
import { QUERY_KEYS } from "./useKritiQ";

export function useDashboard(movieId) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(movieId),
    queryFn: async () => {
      const { data } = await api.get(`/pro/dashboard/${movieId}`);
      return data.data;
    },
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatorMovies() {
  return useQuery({
    queryKey: QUERY_KEYS.creatorMovies(),
    queryFn: async () => {
      const { data } = await api.get("/pro/movies");
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
