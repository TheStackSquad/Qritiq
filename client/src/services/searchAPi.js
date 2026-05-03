// client/src/services/searchApi.js

import api from "@/apiClient/tokenRefresh";

export async function searchMovies(query) {
  // console.log("[searchApi] searchMovies called", { query });

  if (!query || query.length < 2) {
   // console.log("[searchApi] query too short — skipped", { query });
    return [];
  }

  try {
 //   console.log("[searchApi] firing request →", `/movies/search?q=${query}`);

    const { data } = await api.get("/movies/search", {
      params: { q: query },
    });

    // console.log("[searchApi] response received", {
    //   status: "ok",
    //   count: data.data?.length ?? 0,
    //   results: data.data,
    // });

    return data.data ?? [];
  } catch (err) {
    console.error("[searchApi] request failed", {
      message: err.message,
      status: err.response?.status,
      url: err.config?.url,
      params: err.config?.params,
    });
    throw err;
  }
}
