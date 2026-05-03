// client/components/movies/movieGrid.js

import MovieCard from "./movieCards";
import MovieCardSkeleton from "./movieCardSkeletons";

const SKELETON_COUNT = 10;

// Cards above the fold on a 2-column mobile grid = 4 (2 rows × 2 cols).
// These get priority=true → eager fetch, no lazy attribute, browser preloads them.
// Everything else lazy-loads as the user scrolls.
const PRIORITY_COUNT = 4;

export default function MovieGrid({ movies, isLoading, error }) {
  if (error) {
    return (
      <div className="grid-error">
        <p>Couldn&apos;t load movies right now.</p>
        <span>Check your connection and refresh.</span>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {isLoading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : movies?.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              priority={index < PRIORITY_COUNT}
            />
          ))}

      <style jsx>{`
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 480px) {
          .movie-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 768px) {
          .movie-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 1280px) {
          .movie-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .grid-error {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .grid-error p {
          font-family: var(--font-lexend);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-kritiq-silver);
          margin: 0;
        }

        .grid-error span {
          font-family: var(--font-lexend);
          font-size: 13px;
          color: var(--color-kritiq-ash);
        }
      `}</style>
    </div>
  );
}
