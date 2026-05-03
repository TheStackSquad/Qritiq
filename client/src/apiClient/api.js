//client/apiClient/api.js

import axios from "axios";
import Cookies from "js-cookie";

// ─── Base Axios Instance ──────────────────────────────────────────
const api = axios.create({
  //baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  timeout: 15000, // 15s — generous for low-bandwidth Nigerian connections
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // send cookies (session_id, csrf_token)
});

export default api;