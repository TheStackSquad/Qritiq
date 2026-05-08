// client/components/movies/movieSection.js
"use client";

import Link from "next/link";
import { useMovies } from "../../../utils/hooks/useMovie";
import MovieCard from "./movieCards";
import MovieCardSkeleton from "./movieCardSkeletons";

const VISIBLE = 10;

export default function MovieSection() {
  const { data, isLoading, error } = useMovies(1);

  const movies = data?.slice(0, VISIBLE) ?? [];

  return (
    <section className="px-4 sm:px-6 py-10 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Most Hyped Right Now</h2>
        <Link
          href="/movies"
          className="text-sm font-lexend"
          style={{ color: "var(--color-kritiq-silver)" }}
        >
          See all →
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <p
          className="text-sm font-lexend text-center py-8"
          style={{ color: "var(--color-kritiq-ash)" }}
        >
          Couldn&apos;t load movies — check your connection.
        </p>
      )}

      {/* Grid */}
      {!error && (
        <div className="movie-section-grid">
          {isLoading
            ? Array.from({ length: VISIBLE }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))
            : movies.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} priority={i === 0} />
              ))}
        </div>
      )}

      <style jsx>{`
        .movie-section-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 480px) {
          .movie-section-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 768px) {
          .movie-section-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .movie-section-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
