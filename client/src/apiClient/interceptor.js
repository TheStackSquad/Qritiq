//client/apiClient/interceptor.js

import Cookies from "js-cookie";
import api from "./api";

// ─── Request Interceptor ──────────────────────────────────────────
// Automatically attaches the access token and CSRF token to every
// outgoing request. No need to pass headers manually in any hook.

api.interceptors.request.use(
  (config) => {
    // Attach JWT access token
    const token = Cookies.get("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach CSRF token for state-changing requests
    // The Go backend reads X-CSRF-Token and validates against csrf_token cookie
    const csrf = Cookies.get("csrf_token");
    if (csrf && ["post", "put", "patch", "delete"].includes(config.method)) {
      config.headers["X-CSRF-Token"] = csrf;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;