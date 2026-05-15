// client/src/services/spotlightApi.js
import api from "../apiClient/tokenRefresh";
import { SPOTLIGHT_ROUTES } from "../constants/routes";

/**
 * Fetch Spotlight page payload.
 * Returns { featured: Person[], persons: Person[], total: number }
 * @param {{ role?: string, q?: string, page?: number, limit?: number }} params
 */
export async function fetchSpotlight(params = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.q) query.set("q", params.q);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  const qs = query.toString();
  const { data } = await api.get(
    qs ? `${SPOTLIGHT_ROUTES.BASE}?${qs}` : SPOTLIGHT_ROUTES.BASE,
  );
  return data.data;
}

/**
 * Fetch a single person by slug with full credits.
 * @param {string} slug
 */
export async function fetchPerson(slug) {
  const { data } = await api.get(SPOTLIGHT_ROUTES.BY_SLUG(slug));
  return data.data;
}
