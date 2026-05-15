// client/src/utils/hooks/useArena.js
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchArena,
  fetchBattle,
  fetchLeaderboard,
  submitBattleVote,
} from "../../services/arenaApi";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const ARENA_KEYS = {
  arena: () => ["arena"],
  battle: (id) => ["battle", id],
  leaderboard: (type) => ["leaderboard", type],
};

// ─── Arena page payload ───────────────────────────────────────────────────────

/**
 * Fetches the full Arena payload:
 * active_battles, completed_battles, leaderboard.
 * staleTime: 60s — battles update on vote, not on every render.
 */
export function useArena() {
  return useQuery({
    queryKey: ARENA_KEYS.arena(),
    queryFn: fetchArena,
    staleTime: 60 * 1000,
    // Keep previous data visible while refetching — no blank flash
    placeholderData: (prev) => prev,
  });
}

// ─── Single battle ────────────────────────────────────────────────────────────

export function useBattle(id) {
  return useQuery({
    queryKey: ARENA_KEYS.battle(id),
    queryFn: () => fetchBattle(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/**
 * @param {"movie"|"music"|""} contentType - empty = combined
 */
export function useLeaderboard(contentType = "") {
  return useQuery({
    queryKey: ARENA_KEYS.leaderboard(contentType),
    queryFn: () => fetchLeaderboard(contentType),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Vote mutation ────────────────────────────────────────────────────────────

/**
 * Optimistic vote update.
 * Immediately updates the battle card vote bar before server confirmation.
 * Rolls back on error. Refetches on settle to sync real server state.
 */
export function useBattleVote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ battleId, side }) => submitBattleVote(battleId, side),

    onMutate: async ({ battleId, side }) => {
      const key = ARENA_KEYS.battle(battleId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old) => {
        if (!old) return old;
        const isToggle = old.user_vote === side;
        const delta = isToggle ? -1 : 1;
        return {
          ...old,
          votes_a: side === "a" ? old.votes_a + delta : old.votes_a,
          votes_b: side === "b" ? old.votes_b + delta : old.votes_b,
          user_vote: isToggle ? null : side,
          total_votes: isToggle ? old.total_votes - 1 : old.total_votes + 1,
        };
      });

      // Also update in arena list if present
      qc.setQueryData(ARENA_KEYS.arena(), (old) => {
        if (!old) return old;
        const patch = (battles) =>
          battles?.map((b) => {
            if (b.id !== battleId) return b;
            const isToggle = b.user_vote === side;
            const delta = isToggle ? -1 : 1;
            return {
              ...b,
              votes_a: side === "a" ? b.votes_a + delta : b.votes_a,
              votes_b: side === "b" ? b.votes_b + delta : b.votes_b,
              user_vote: isToggle ? null : side,
            };
          });
        return {
          ...old,
          active_battles: patch(old.active_battles),
        };
      });

      return { previous, key };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
    },

    onSettled: (_data, _err, { battleId }) => {
      qc.invalidateQueries({ queryKey: ARENA_KEYS.battle(battleId) });
      qc.invalidateQueries({ queryKey: ARENA_KEYS.arena() });
    },
  });
}
