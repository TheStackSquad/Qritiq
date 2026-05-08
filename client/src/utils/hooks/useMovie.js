"use client";
//client/utils/hooks/useMovie.js

import { useQuery } from "@tanstack/react-query";
import api from "../../apiClient/tokenRefresh";
import { QUERY_KEYS } from "./useKritiQ";


export function useMovies(page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.movies(page),
    queryFn: async () => {
      const { data } = await api.get(`/movies?page=${page}`);
      const { pre_release = [], released = [] } = data.data;
      return [...pre_release, ...released];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMovie(slug) {
  return useQuery({
    queryKey: QUERY_KEYS.movie(slug),
    queryFn: async () => {
      const { data } = await api.get(`/movies/${slug}`);
      return data.data;
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
}
