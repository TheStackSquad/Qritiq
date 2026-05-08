// client/src/components/musicDetails/musicSkeletons.js

"use client";

// ─── Card skeleton ─────────────────────────────────────────────────────────

export function MusicCardSkeleton() {
  return (
    <div className="msk-root">
      <div className="msk-cover shimmer" />
      <div className="msk-info">
        <div className="msk-line msk-line--title shimmer" />
        <div className="msk-line msk-line--sub shimmer" />
        <div className="msk-line msk-line--xs shimmer" />
      </div>
      <style jsx>{`
        .msk-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .msk-cover {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
        }
        .msk-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 2px;
        }
        .msk-line {
          border-radius: 6px;
          height: 12px;
        }
        .msk-line--title {
          width: 80%;
        }
        .msk-line--sub {
          width: 55%;
          height: 10px;
        }
        .msk-line--xs {
          width: 35%;
          height: 9px;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--color-kritiq-dark-2, #1a1a1a) 25%,
            var(--color-kritiq-dark-3, #252525) 50%,
            var(--color-kritiq-dark-2, #1a1a1a) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Grid of skeletons ──────────────────────────────────────────────────────

export function MusicGridSkeleton({ count = 6 }) {
  return (
    <div className="msgs-root">
      {Array.from({ length: count }).map((_, i) => (
        <MusicCardSkeleton key={i} />
      ))}
      <style jsx>{`
        .msgs-root {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 0 16px;
        }
        @media (min-width: 640px) {
          .msgs-root {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Slug page hero skeleton ─────────────────────────────────────────────────

export function MusicDetailSkeleton() {
  return (
    <div className="mds-root">
      <div className="mds-hero shimmer" />
      <div className="mds-body">
        <div className="mds-line mds-line--lg shimmer" />
        <div className="mds-line mds-line--md shimmer" />
        <div className="mds-line mds-line--sm shimmer" />
        <div className="mds-player shimmer" />
      </div>
      <style jsx>{`
        .mds-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px;
        }
        .mds-hero {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          max-width: 280px;
          margin: 0 auto;
        }
        .mds-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mds-line {
          border-radius: 8px;
          height: 14px;
        }
        .mds-line--lg {
          width: 70%;
          height: 24px;
        }
        .mds-line--md {
          width: 45%;
          height: 14px;
        }
        .mds-line--sm {
          width: 30%;
          height: 11px;
        }
        .mds-player {
          height: 56px;
          border-radius: 12px;
          margin-top: 8px;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--color-kritiq-dark-2, #1a1a1a) 25%,
            var(--color-kritiq-dark-3, #252525) 50%,
            var(--color-kritiq-dark-2, #1a1a1a) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
