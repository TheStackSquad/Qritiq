// client/utils/hooks/useMusic.js
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchMusic,
  fetchMusic_bySlug,
  searchMusic,
  fetchTrendingMusic,
  fetchMusicByGenre,
  fetchPreReleaseMusic,
} from "../../services/musicApi";
import { useDebounce } from "use-debounce";

export const MUSIC_QUERY_KEYS = {
  list: (page) => ["music-list", page],
  track: (slug) => ["music-track", slug],
  trending: () => ["music-trending"],
  genre: (genre) => ["music-genre", genre],
  preRelease: () => ["music-pre-release"],
  search: (q) => ["music-search", q],
};

export function useMusicList(page = 1) {
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.list(page),
    queryFn: () => fetchMusic(page),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useMusicTrack(slug) {
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.track(slug),
    queryFn: () => fetchMusic_bySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrendingMusic(limit = 10) {
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.trending(),
    queryFn: () => fetchTrendingMusic(limit),
    staleTime: 3 * 60 * 1000,
  });
}

export function useMusicByGenre(genre, limit = 10) {
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.genre(genre),
    queryFn: () => fetchMusicByGenre(genre, limit),
    enabled: !!genre,
    staleTime: 3 * 60 * 1000,
  });
}

export function usePreReleaseMusic(limit = 10) {
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.preRelease(),
    queryFn: () => fetchPreReleaseMusic(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMusicSearch(query) {
  const [debounced] = useDebounce(query, 300);
  return useQuery({
    queryKey: MUSIC_QUERY_KEYS.search(debounced),
    queryFn: () => searchMusic(debounced),
    enabled: !!debounced && debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
}
