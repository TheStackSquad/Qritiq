// client/components/movies/movieCardSkeletons.js

export default function MovieCardSkeleton() {
  return (
    <div className="skeleton-card">
      {/* Poster skeleton */}
      <div className="skeleton-poster skeleton" />
      {/* Title skeleton */}
      <div className="skeleton-meta">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-genre" />
      </div>

      <style jsx>{`
        .skeleton-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-poster {
          aspect-ratio: 2 / 3;
          border-radius: var(--radius-card);
          width: 100%;
        }

        .skeleton-meta {
          padding: 0 2px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .skeleton-title {
          height: 13px;
          width: 85%;
          border-radius: 4px;
        }

        .skeleton-genre {
          height: 11px;
          width: 50%;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
