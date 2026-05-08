//client/services/loginApi.js

import api from "../apiClient/tokenRefresh";
import { AUTH_ROUTES } from "../constants/routes";

// ─── Login ────────────────────────────────────────────────────────
export async function loginAPI({ email, password }) {
  const { data } = await api.post(AUTH_ROUTES.LOGIN, { email, password });
  return data.data;
}

// ─── Signup ───────────────────────────────────────────────────────
export async function signupAPI({ email, username, password }) {
  const { data } = await api.post(AUTH_ROUTES.REGISTER, {
    email,
    username,
    password,
  });
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────
export async function logoutAPI(refreshToken) {
  const { data } = await api.post(AUTH_ROUTES.LOGOUT, {
    refresh_token: refreshToken,
  });
  return data;
}

// ─── Get Current User ─────────────────────────────────────────────
export async function getMeAPI() {
  const { data } = await api.get(AUTH_ROUTES.ME);
  return data.data;
}

// ─── Forgot Password (stub — sends reset email in prod) ───────────
export async function forgotPasswordAPI({ email }) {
  // For the pitch: returns success always, email logic wired in v2
  const { data } = await api.post(AUTH_ROUTES.FORGOT_PASSWORD, { email });
  return data;
}

export { signupAPI as registerUser };