// client/src/app/movies/page.js
"use client";

import { useState, useMemo } from "react";
import { useMovies } from "../../utils/hooks/useMovie";
import MovieGrid from "../../components/movies/movieUI/movieGrid";
import MovieFilterBar from "../../components/movies/movieUI/movieFilterBar";
import Footer from "../../components/home/footer/index";

export default function MoviesPage() {
  const [filter, setFilter] = useState("all");
  const [page] = useState(1);

  const { data, isLoading, error } = useMovies(page);

  // ── Counts for filter tab badges ──────────────────────────────
  const counts = useMemo(() => {
    if (!data) return { all: 0, pre_release: 0, released: 0 };
    return {
      all: data.length,
      pre_release: data.filter((m) => m.status === "pre_release").length,
      released: data.filter((m) => m.status === "released").length,
    };
  }, [data]);

  // ── Filter + sort ─────────────────────────────────────────────
  // Sort rule:
  //   pre_release  → by hype_score DESC (highest hype first)
  //   released     → by rating_score DESC, then total_likes DESC
  //   all          → pre_release block first (hype DESC), then released (rating DESC)
  const filtered = useMemo(() => {
    if (!data) return [];

    const parseNum = (v) => parseFloat(v ?? 0) || 0;

    const sortPreRelease = (a, b) =>
      parseNum(b.hype_score) - parseNum(a.hype_score);

    const sortReleased = (a, b) => {
      const ratingDiff = parseNum(b.rating_score) - parseNum(a.rating_score);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.total_likes ?? 0) - (a.total_likes ?? 0);
    };

    if (filter === "pre_release") {
      return [...data]
        .filter((m) => m.status === "pre_release")
        .sort(sortPreRelease);
    }

    if (filter === "released") {
      return [...data]
        .filter((m) => m.status === "released")
        .sort(sortReleased);
    }

    // "all" — pre_release block leads, released block follows
    const preRelease = [...data]
      .filter((m) => m.status === "pre_release")
      .sort(sortPreRelease);
    const released = [...data]
      .filter((m) => m.status === "released")
      .sort(sortReleased);

    return [...preRelease, ...released];
  }, [data, filter]);

  return (
    <>
      <main
        className="pt-16 min-h-screen"
        style={{ background: "var(--color-kritiq-black)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* ── Page header ──────────────────────────────────── */}
          <div className="py-10 sm:py-14 space-y-2">
            <div className="hype-badge inline-flex">🎬 Nollywood</div>
            <h1
              className="font-clash font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
              style={{ color: "var(--color-kritiq-white)" }}
            >
              Movies
            </h1>
            <p
              className="text-sm sm:text-base max-w-lg"
              style={{ color: "var(--color-kritiq-ash)" }}
            >
              Rate upcoming releases before they drop, or review what&apos;s
              already out. Every vote shapes the hype meter.
            </p>
          </div>

          {/* ── Filter bar ───────────────────────────────────── */}
          <div className="mb-6">
            <MovieFilterBar
              active={filter}
              onChange={setFilter}
              counts={counts}
            />
          </div>

          {/* ── Results count ────────────────────────────────── */}
          {!isLoading && !error && (
            <p
              className="text-xs font-lexend mb-4"
              style={{ color: "var(--color-kritiq-ash)" }}
            >
              {filtered.length} {filtered.length === 1 ? "title" : "titles"}
            </p>
          )}

          {/* ── Grid ─────────────────────────────────────────── */}
          <MovieGrid movies={filtered} isLoading={isLoading} error={error} />

          <div className="h-16" />
        </div>
      </main>

      <Footer />
    </>
  );
}
