// client/src/components/topRated/topRatedUI/spotlightSkeletons.js
"use client";

/**
 * SpotlightSkeletons
 * Loading states specific to the Spotlight section and person slug page.
 * Shimmer animation is CSS-only — no JS, no libraries.
 * All containers match the exact rendered dimensions to prevent CLS.
 */

// ─── Shared shimmer ───────────────────────────────────────────────────────────

const SHIMMER = `
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

// ─── Featured hero skeleton ───────────────────────────────────────────────────

export function FeaturedHeroSkeleton() {
  return (
    <div
      className="fhs-root"
      aria-busy="true"
      aria-label="Loading featured person"
    >
      <div className="fhs-photo shimmer" />
      <div className="fhs-body">
        <div className="fhs-role shimmer" />
        <div className="fhs-name shimmer" />
        <div className="fhs-bio shimmer" />
        <div className="fhs-bio fhs-bio--short shimmer" />
        <div className="fhs-cta shimmer" />
      </div>

      <style jsx>{`
        ${SHIMMER}
        .fhs-root {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-radius: 16px;
          overflow: hidden;
          margin: 0 16px;
          border: 1px solid rgba(139, 92, 246, 0.15);
        }
        .fhs-photo {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 0;
        }
        .fhs-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fhs-role {
          height: 12px;
          width: 80px;
          border-radius: 99px;
        }
        .fhs-name {
          height: 24px;
          width: 65%;
        }
        .fhs-bio {
          height: 12px;
          width: 100%;
        }
        .fhs-bio--short {
          width: 55%;
        }
        .fhs-cta {
          height: 14px;
          width: 100px;
          border-radius: 99px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

// ─── Person detail hero skeleton (slug page) ─────────────────────────────────

export function PersonDetailSkeleton() {
  return (
    <div
      className="pds-root"
      aria-busy="true"
      aria-label="Loading person profile"
    >
      {/* Photo */}
      <div className="pds-photo shimmer" />

      {/* Meta */}
      <div className="pds-meta">
        <div className="pds-role shimmer" />
        <div className="pds-name shimmer" />
        <div className="pds-scores">
          <div className="pds-score shimmer" />
          <div className="pds-score shimmer" />
        </div>
        <div className="pds-bio shimmer" />
        <div className="pds-bio pds-bio--short shimmer" />
      </div>

      {/* Social links row */}
      <div className="pds-socials">
        {[0, 1, 2].map((i) => (
          <div key={i} className="pds-social shimmer" />
        ))}
      </div>

      {/* Works panel skeleton */}
      <div className="pds-section-label shimmer" />
      <div className="pds-works">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pds-work-card shimmer" />
        ))}
      </div>

      <style jsx>{`
        ${SHIMMER}
        .pds-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }
        .pds-photo {
          width: min(240px, 70vw);
          aspect-ratio: 1/1;
          border-radius: 50%;
          margin: 0 auto;
          /* Square fallback for older browsers */
          border-radius: 16px;
        }
        .pds-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pds-role {
          height: 12px;
          width: 90px;
          border-radius: 99px;
        }
        .pds-name {
          height: 28px;
          width: 60%;
        }
        .pds-scores {
          display: flex;
          gap: 10px;
        }
        .pds-score {
          height: 20px;
          width: 80px;
          border-radius: 99px;
        }
        .pds-bio {
          height: 12px;
          width: 100%;
        }
        .pds-bio--short {
          width: 70%;
        }

        .pds-socials {
          display: flex;
          gap: 10px;
        }
        .pds-social {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .pds-section-label {
          height: 14px;
          width: 120px;
          margin-bottom: 4px;
        }

        .pds-works {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .pds-work-card {
          aspect-ratio: 2/3;
          border-radius: 10px;
        }

        @media (min-width: 640px) {
          .pds-works {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .pds-works {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Leaderboard row skeleton (reusable in leaderboard section) ───────────────

export function LeaderboardRowSkeleton() {
  return (
    <div
      className="lrs-root"
      aria-busy="true"
      aria-label="Loading leaderboard entry"
    >
      <div className="lrs-rank shimmer" />
      <div className="lrs-thumb shimmer" />
      <div className="lrs-body">
        <div className="lrs-title shimmer" />
        <div className="lrs-bar shimmer" />
      </div>
      <div className="lrs-score shimmer" />

      <style jsx>{`
        ${SHIMMER}
        .lrs-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
        }
        .lrs-rank {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .lrs-thumb {
          width: 40px;
          height: 52px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .lrs-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .lrs-title {
          height: 13px;
          width: 65%;
        }
        .lrs-bar {
          height: 5px;
          width: 100%;
          border-radius: 99px;
        }
        .lrs-score {
          width: 36px;
          height: 20px;
          border-radius: 6px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
