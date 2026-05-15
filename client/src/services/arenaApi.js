// client/src/services/arenaApi.js


import api from "../apiClient/tokenRefresh";
import { ARENA_ROUTES } from "../constants/routes";

/**
 * Fetch full Arena page payload.
 * Returns { active_battles, completed_battles, leaderboard }
 */
export async function fetchArena() {
  const { data } = await api.get(ARENA_ROUTES.BASE);
  return data.data;
}

/**
 * Fetch a single battle by ID.
 * @param {string} id - battle UUID
 */
export async function fetchBattle(id) {
  const { data } = await api.get(ARENA_ROUTES.BATTLE(id));
  return data.data;
}

/**
 * Submit or toggle a vote on a battle.
 * @param {string} battleId - battle UUID
 * @param {"a"|"b"} side   - which side to vote for
 */
export async function submitBattleVote(battleId, side) {
  const { data } = await api.post(ARENA_ROUTES.VOTE, {
    battle_id: battleId,
    side,
  });
  return data.data;
}

/**
 * Fetch Street Pull leaderboard.
 * @param {"movie"|"music"|""} contentType - empty = combined
 * @param {number} limit
 */
export async function fetchLeaderboard(contentType = "", limit = 20) {
  const params = new URLSearchParams({ limit });
  if (contentType) params.set("type", contentType);
  const { data } = await api.get(`${ARENA_ROUTES.LEADERBOARD}?${params}`);
  return data.data;
}
