// client/services/movieApi.js
import api from "@/apiClient/tokenRefresh";
import { MOVIE_ROUTES } from "@/constants/routes";

// ─── List movies (paginated) ──────────────────────────────────────
export async function fetchMovies(page = 1) {
  const { data } = await api.get(`${MOVIE_ROUTES.LIST}?page=${page}`);
  return data.data;
}

// ─── Single movie by slug ─────────────────────────────────────────
export async function fetchMovie(slug) {
  const { data } = await api.get(MOVIE_ROUTES.BY_SLUG(slug));
  return data.data;
}

// ─── Search ───────────────────────────────────────────────────────
export async function searchMovies(query) {
  const { data } = await api.get(
    `${MOVIE_ROUTES.SEARCH}?q=${encodeURIComponent(query)}`
  );
  return data.data;
}

// ─── Trending — top movies by hype score ─────────────────────────
export async function fetchTrending(limit = 10) {
  const { data } = await api.get(`${MOVIE_ROUTES.LIST}?page=1&limit=${limit}`);
  return data.data;
}