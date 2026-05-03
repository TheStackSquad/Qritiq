// client/src/components/common/search/SearchResultsSkeleton.js

export default function SearchResultsSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="srs-row">
          <div className="srs-poster" />
          <div className="srs-lines">
            <div className="srs-line srs-line--title" />
            <div className="srs-line srs-line--sub" />
            <div className="srs-line srs-line--score" />
          </div>

          <style jsx>{`
            /* ── Row ──────────────────────────────────────────── */

            .srs-row {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 14px 16px;
              border-radius: var(--radius-card);
              border: 1px solid var(--color-kritiq-dark-3);
              background: var(--color-kritiq-dark-1);
            }

            /* ── Poster ───────────────────────────────────────── */

            .srs-poster {
              width: 52px;
              height: 78px;
              border-radius: 6px;
              background: var(--color-kritiq-dark-3);
              flex-shrink: 0;
              animation: shimmer 1.4s ease infinite;
            }

            /* ── Lines ────────────────────────────────────────── */

            .srs-lines {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .srs-line {
              border-radius: 4px;
              background: var(--color-kritiq-dark-3);
              animation: shimmer 1.4s ease infinite;
            }

            .srs-line--title {
              height: 14px;
              width: 55%;
            }

            .srs-line--sub {
              height: 11px;
              width: 35%;
              animation-delay: 0.1s;
            }

            .srs-line--score {
              height: 11px;
              width: 20%;
              animation-delay: 0.2s;
            }

            /* ── Shimmer ──────────────────────────────────────── */

            @keyframes shimmer {
              0%,
              100% {
                opacity: 0.4;
              }
              50% {
                opacity: 0.9;
              }
            }
          `}</style>
        </div>
      ))}
    </>
  );
}
