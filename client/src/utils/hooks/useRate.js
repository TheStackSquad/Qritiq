"use client";
//client/utils/hooks/useRate.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/apiClient/tokenRefresh";
import { QUERY_KEYS } from "./useKritiQ";

export function useRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, contentType, score }) => {
      const { data } = await api.post("/rate", {
        content_id: contentId,
        content_type: contentType,
        score,
      });
      return data.data;
    },
    onSuccess: (_data, { slug, contentType }) => {
      queryClient.invalidateQueries({
        queryKey:
          contentType === "movie"
            ? QUERY_KEYS.movie(slug)
            : QUERY_KEYS.music(slug),
      });
    },
  });
}
