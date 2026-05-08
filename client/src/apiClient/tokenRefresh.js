//client/apiClient/tokenRefresh.js

import Cookies from "js-cookie";
import api from "./api";
import { AUTH_ROUTES } from "../constants/routes";
import "./interceptor";


let isRefreshing = false;
let refreshQueue = []; // pending requests waiting for the new token

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only handle 401 — not a retry, not a refresh call itself
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes(AUTH_ROUTES.REFRESH) ||
      original.url?.includes(AUTH_ROUTES.LOGIN)
    ) {
      return Promise.reject(error);
    }

    // Mark this request as a retry so we don't loop
    original._retry = true;

    if (isRefreshing) {
      // Queue this request until the ongoing refresh resolves
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers["Authorization"] = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;

    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) {
      clearAndRedirect();
      return Promise.reject(error);
    }

    try {
      const { data } = await api.post(AUTH_ROUTES.REFRESH, {
        refresh_token: refreshToken,
      });

      const { access_token, expires_at } = data.data;

      // Update stored token
      Cookies.set("access_token", access_token, {
        expires: new Date(expires_at),
        sameSite: "Lax",
      });

      // Update Zustand store without importing it here (avoids circular deps)
      // We dispatch a custom event that ZustandProvider listens to
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kritiq:token-refreshed", {
            detail: { access_token, expires_at },
          })
        );
      }

      api.defaults.headers["Authorization"] = `Bearer ${access_token}`;
      original.headers["Authorization"]     = `Bearer ${access_token}`;

      processQueue(null, access_token);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function clearAndRedirect() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("kritiq_user");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kritiq:session-expired"));
  }
}

export default api;
