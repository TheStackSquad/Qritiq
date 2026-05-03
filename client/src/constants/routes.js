// client/constants/routes.js

export const API_VERSION = "/api/v1"; // keep for reference only

// ─── Auth ─────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  FORGOT_PASSWORD: "/auth/forgot_password",
};

// ─── Movies ───────────────────────────────────────────────────────
export const MOVIE_ROUTES = {
  LIST: "/movies",
  SEARCH: "/movies/search",
  BY_SLUG: (slug) => `/movies/${slug}`,
};

// ─── Music ────────────────────────────────────────────────────────
export const MUSIC_ROUTES = {
  LIST: "/music",
  BY_SLUG: (slug) => `/music/${slug}`,
  SEARCH: "/music/search",
};

// ─── Engagement ───────────────────────────────────────────────────
export const ENGAGE_ROUTES = {
  SUBMIT: "/engage",
};

// ─── Ratings ──────────────────────────────────────────────────────
export const RATE_ROUTES = {
  SUBMIT: "/rate",
};

// ─── Media ────────────────────────────────────────────────────────
export const MEDIA_ROUTES = {
  UPLOAD: "/media/upload",
  DELETE: "/media/delete",
};

// ─── Pro Dashboard ────────────────────────────────────────────────
export const PRO_ROUTES = {
  MOVIES: "/pro/movies",
  DASHBOARD: (movieId) => `/pro/dashboard/${movieId}`,
};

// ─── Health ───────────────────────────────────────────────────────
export const HEALTH_ROUTE = "/health"; // no /api/v1 prefix — correct
