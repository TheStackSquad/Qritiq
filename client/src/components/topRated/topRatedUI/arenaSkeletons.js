// client/src/components/topRated/topRatedUI/arenaSkeletons.js
"use client";

/**
 * Skeleton loaders for all three /top-rated sections.
 * CSS shimmer only — no JS, no libraries.
 * Reserves layout space precisely so there is zero CLS on data load.
 */

// ─── Shared shimmer style ─────────────────────────────────────────────────────

const SHIMMER_STYLE = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
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
    border-radius: 8px;
  }
`;

// ─── Battle card skeleton ─────────────────────────────────────────────────────

export function BattleCardSkeleton() {
  return (
    <div className="bcs-root" aria-busy="true" aria-label="Loading battle">
      <div className="bcs-covers">
        <div className="bcs-cover shimmer" />
        <div className="bcs-vs">VS</div>
        <div className="bcs-cover shimmer" />
      </div>
      <div className="bcs-bar shimmer" />
      <div className="bcs-city-row">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bcs-city shimmer" />
        ))}
      </div>

      <style jsx>{`
        ${SHIMMER_STYLE}
        .bcs-root {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }
        .bcs-covers {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 8px;
        }
        .bcs-cover {
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          width: 100%;
        }
        .bcs-vs {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 700;
          color: var(--color-kritiq-ash, #555);
          letter-spacing: 0.08em;
        }
        .bcs-bar   { height: 8px; border-radius: 99px; }
        .bcs-city-row { display: flex; gap: 6px; }
        .bcs-city  { flex: 1; height: 28px; border-radius: 8px; }
      `}</style>
    </div>
  );
}

// ─── Leaderboard skeleton ─────────────────────────────────────────────────────

export function LeaderboardSkeleton({ count = 8 }) {
  return (
    <div className="ls-root" aria-busy="true" aria-label="Loading leaderboard">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ls-row">
          <div className="ls-rank shimmer" />
          <div className="ls-thumb shimmer" />
          <div className="ls-info">
            <div className="ls-title shimmer" />
            <div className="ls-score shimmer" />
          </div>
        </div>
      ))}

      <style jsx>{`
        ${SHIMMER_STYLE}
        .ls-root { display: flex; flex-direction: column; gap: 10px; padding: 0 16px; }
        .ls-row  { display: flex; align-items: center; gap: 10px; }
        .ls-rank { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
        .ls-thumb { width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0; }
        .ls-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .ls-title { height: 13px; width: 65%; }
        .ls-score { height: 8px; width: 45%; }
      `}</style>
    </div>
  );
}

// ─── Person card skeleton ─────────────────────────────────────────────────────

export function PersonCardSkeleton() {
  return (
    <div className="pcs-root" aria-busy="true" aria-label="Loading person">
      <div className="pcs-photo shimmer" />
      <div className="pcs-name shimmer" />
      <div className="pcs-role shimmer" />

      <style jsx>{`
        ${SHIMMER_STYLE}
        .pcs-root  { display: flex; flex-direction: column; gap: 8px; }
        .pcs-photo { width: 100%; aspect-ratio: 1/1; border-radius: 12px; }
        .pcs-name  { height: 13px; width: 75%; }
        .pcs-role  { height: 10px; width: 50%; }
      `}</style>
    </div>
  );
}

// ─── Person grid skeleton ─────────────────────────────────────────────────────

export function PersonGridSkeleton({ count = 6 }) {
  return (
    <div className="pgs-root" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
      <style jsx>{`
        .pgs-root {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 0 16px;
        }
        @media (min-width: 640px) {
          .pgs-root { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .pgs-root { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}

// ─── Featured spotlight skeleton ──────────────────────────────────────────────

export function FeaturedSpotlightSkeleton() {
  return (
    <div className="fss-root" aria-busy="true" aria-label="Loading featured person">
      <div className="fss-photo shimmer" />
      <div className="fss-body">
        <div className="fss-badge shimmer" />
        <div className="fss-name shimmer" />
        <div className="fss-bio shimmer" />
        <div className="fss-bio fss-bio--short shimmer" />
      </div>

      <style jsx>{`
        ${SHIMMER_STYLE}
        .fss-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }
        .fss-photo { width: 100%; aspect-ratio: 3/2; border-radius: 16px; }
        .fss-body  { display: flex; flex-direction: column; gap: 10px; }
        .fss-badge { height: 20px; width: 100px; border-radius: 99px; }
        .fss-name  { height: 28px; width: 70%; }
        .fss-bio   { height: 12px; width: 100%; }
        .fss-bio--short { width: 60%; }

        @media (min-width: 768px) {
          .fss-root { flex-direction: row; align-items: center; }
          .fss-photo { width: 280px; flex-shrink: 0; aspect-ratio: 1/1; }
        }
      `}</style>
    </div>
  );
}