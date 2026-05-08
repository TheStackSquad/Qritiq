// client/utils/hooks/useEngagement.js
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../apiClient/tokenRefresh";
import { QUERY_KEYS } from "./useKritiQ";

export function useEngage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, contentType, engagementType }) => {
      const { data } = await api.post("/engage", {
        content_id:      contentId,
        content_type:    contentType,
        engagement_type: engagementType,
      });
      return data.data;
    },

    // Optimistic update — UI reflects vote instantly before server confirms
    onMutate: async ({ contentType, engagementType, slug }) => {
      const key = contentType === "movie"
        ? QUERY_KEYS.movie(slug)
        : QUERY_KEYS.music(slug);

      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old) => {
        if (!old) return old;
        const state   = old.user_engagement || {};
        const updates = {};

        if (engagementType === "like") {
          updates.has_liked    = !state.has_liked;
          updates.has_disliked = false;
          updates.total_likes  = (old.total_likes || 0) + (state.has_liked ? -1 : 1);
        } else if (engagementType === "dislike") {
          updates.has_disliked = !state.has_disliked;
          updates.has_liked    = false;
          updates.total_dislikes = (old.total_dislikes || 0) + (state.has_disliked ? -1 : 1);
        } else if (["hype", "meh", "flop"].includes(engagementType)) {
          updates.hype_vote = state.hype_vote === engagementType ? "" : engagementType;
        }

        return { ...old, user_engagement: { ...state, ...updates } };
      });

      return { previous, key };
    },

    // Roll back optimistic update on server error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },

    // Refetch from server after settle — keeps UI in sync with real state
    onSettled: (_data, _err, { slug, contentType }) => {
      const key = contentType === "movie"
        ? QUERY_KEYS.movie(slug)
        : QUERY_KEYS.music(slug);
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}