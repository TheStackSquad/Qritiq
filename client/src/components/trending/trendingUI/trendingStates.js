// src/components/trending/trendingUI/trendingStates.js
"use client";

export function TrendingSkeleton({ rows = 5 }) {
  return (
    <div
      className="skeleton-list"
      aria-busy="true"
      aria-label="Loading trending data"
    >
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="skeleton-row"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}

      <style jsx>{`
        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .skeleton-row {
          height: 72px;
          border-radius: 12px;
          background: var(--color-kritiq-dark-2);
          animation: pulse 1.6s ease-in-out infinite both;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.35;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-row {
            animation: none;
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export function TrendingError({ onRetry }) {
  return (
    <div className="error-state" role="alert" aria-live="polite">
      <div className="error-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="var(--color-kritiq-dark-3)"
            strokeWidth="1.5"
          />
          <path
            d="M16 9v9"
            stroke="#FF4433"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="22" r="1.2" fill="#FF4433" />
        </svg>
      </div>
      <p className="error-title">Couldn&apos;t load trending data</p>
      <p className="error-sub">Check your connection and try again.</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      )}

      <style jsx>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          gap: 8px;
          text-align: center;
        }
        .error-icon {
          margin-bottom: 4px;
        }
        .error-title {
          font-family: var(--font-lexend);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-kritiq-white);
          margin: 0;
        }
        .error-sub {
          font-family: var(--font-gilroy);
          font-size: 12px;
          color: var(--color-kritiq-ash);
          margin: 0 0 8px;
        }
        .retry-btn {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-kritiq-ember);
          background: rgba(192, 0, 26, 0.08);
          border: 1px solid rgba(192, 0, 26, 0.2);
          border-radius: 20px;
          padding: 6px 16px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .retry-btn:hover {
          background: rgba(192, 0, 26, 0.15);
        }
      `}</style>
    </div>
  );
}
