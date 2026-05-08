// client/src/utils/hooks/useTrending.js
// client/src/utils/hooks/useTrending.js
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../../apiClient/tokenRefresh";

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Kept local — trending keys don't need to be invalidated by other hooks,
// and they're not referenced in QUERY_KEYS since they're not entity-based.

const TRENDING_KEYS = {
  hypeRadar:    ["trending", "hype-radar"],
  verdictSplit: ["trending", "verdict-split"],
};

// ─── Hype Radar ───────────────────────────────────────────────────────────────
// Returns movies ordered by absolute 7-day hype_score delta.
// Rising and falling split is done in the component — hook just fetches.
// staleTime matches the server-side Redis TTL (10 min) so refetches
// only happen when the cache has actually expired.

export function useHypeRadar() {
  return useQuery({
    queryKey: TRENDING_KEYS.hypeRadar,
    queryFn: async () => {
      const { data } = await api.get("/trending/hype-radar");
      return data.data; // [{ id, title, slug, genre, status, currentScore, weeklyDelta, totalVotes }]
    },
    staleTime:        10 * 60 * 1000, // 10 min — mirrors Redis TTL
    gcTime:           15 * 60 * 1000, // keep in memory 5 min past stale
    placeholderData:  [],              // component never sees undefined
  });
}

// ─── Verdict Split ────────────────────────────────────────────────────────────
// Returns movies that have BOTH critic and user ratings.
// criticScore and streetScore arrive pre-normalised to 0–100 from the server.

export function useVerdictSplit() {
  return useQuery({
    queryKey: TRENDING_KEYS.verdictSplit,
    queryFn: async () => {
      const { data } = await api.get("/trending/verdict-split");
      return data.data; // [{ id, title, slug, status, criticScore, streetScore, totalVotes }]
    },
    staleTime:        10 * 60 * 1000,
    gcTime:           15 * 60 * 1000,
    placeholderData:  [],
  });
}

