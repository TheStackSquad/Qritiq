// client/src/utils/hooks/useSpotlight.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPerson, fetchSpotlight } from "../../services/spotlightApi";
import { useDebounce } from "use-debounce";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SPOTLIGHT_KEYS = {
  list: (params) => ["spotlight", params],
  person: (slug) => ["spotlight-person", slug],
};

// ─── Spotlight list ───────────────────────────────────────────────────────────

/**
 * @param {{ role?: string, q?: string, page?: number }} params
 */
export function useSpotlight(params = {}) {
  const [debouncedQ] = useDebounce(params.q ?? "", 300);
  const stableParams = { ...params, q: debouncedQ };

  return useQuery({
    queryKey: SPOTLIGHT_KEYS.list(stableParams),
    queryFn: () => fetchSpotlight(stableParams),
    staleTime: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Single person ────────────────────────────────────────────────────────────

export function usePerson(slug) {
  return useQuery({
    queryKey: SPOTLIGHT_KEYS.person(slug),
    queryFn: () => fetchPerson(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
