// client/services/musicApi.js
import api from "../apiClient/tokenRefresh";
import { MUSIC_ROUTES } from "../constants/routes";

// ─── List music (paginated) ───────────────────────────────────────────
export async function fetchMusic(page = 1, limit = 20) {
  const { data } = await api.get(
    `${MUSIC_ROUTES.LIST}?page=${page}&limit=${limit}`,
  );
  return data.data;
}

// ─── Single track by slug ─────────────────────────────────────────────
export async function fetchMusic_bySlug(slug) {
  const { data } = await api.get(MUSIC_ROUTES.BY_SLUG(slug));
  return data.data;
}

// ─── Search tracks ────────────────────────────────────────────────────
export async function searchMusic(query) {
  const { data } = await api.get(
    `${MUSIC_ROUTES.SEARCH}?q=${encodeURIComponent(query)}`,
  );
  return data.data;
}

// ─── Trending — top tracks by hype score ─────────────────────────────
export async function fetchTrendingMusic(limit = 10) {
  const { data } = await api.get(
    `${MUSIC_ROUTES.LIST}?page=1&limit=${limit}&sort=hype`,
  );
  return data.data;
}

// ─── By genre ─────────────────────────────────────────────────────────
export async function fetchMusicByGenre(genre, limit = 10) {
  const { data } = await api.get(
    `${MUSIC_ROUTES.LIST}?genre=${encodeURIComponent(genre)}&limit=${limit}`,
  );
  return data.data;
}

// ─── Pre-release only ─────────────────────────────────────────────────
export async function fetchPreReleaseMusic(limit = 10) {
  const { data } = await api.get(
    `${MUSIC_ROUTES.LIST}?status=pre_release&limit=${limit}`,
  );
  return data.data;
}
