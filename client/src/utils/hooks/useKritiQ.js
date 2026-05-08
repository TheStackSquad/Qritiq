"use client";
//client/utils/hooks/useKritiQ.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../sessions/userSessions";
import { useRouter } from "next/navigation";
import { searchMovies } from "../../services/searchAPi";
import { useDebounce } from "use-debounce";

// Centralised to avoid typo-driven cache bugs
export const QUERY_KEYS = {
  movies: (page) => ["movies", page],
  movie: (slug) => ["movie", slug],
  musicList: (page) => ["music", page],
  music: (slug) => ["music", slug],
  search: (q) => ["search", q],
  dashboard: (id) => ["dashboard", id],
  creatorMovies: () => ["creator-movies"],
};

/**
 * Hook for global search functionality
 */
export const useSearch = (query) => {
  const [debouncedQuery] = useDebounce(query, 300);

  console.log("[useSearch] render", {
    raw: query,
    debounced: debouncedQuery,
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
  });

  return useQuery({
    queryKey: QUERY_KEYS.search(debouncedQuery),
    queryFn: async () => {
     // console.log("[useSearch] queryFn fired", { debouncedQuery });
      const results = await searchMovies(debouncedQuery);
     // console.log("[useSearch] queryFn resolved", { count: results.length });
      return results;
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: [],
    onError: (err) => {
      console.error("[useSearch] query error", { err });
    },
  });
};

/**
 * Hook to handle user logout logic
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      // If you have a logout API endpoint, call it here
      // await fetch('/api/auth/logout', { method: 'POST' });
      return true;
    },
    onSuccess: () => {
      clearSession(); // Clear Zustand store
      queryClient.clear(); // Clear React Query cache
      router.push("/"); // Redirect to home
    },
  });
};
