// src/app/music/page.js

"use client";

// export const metadata = {
//   title: "Music — KritiQ",
//   description: "Music reviews and ratings are coming soon to KritiQ.",
// };

export default function MusicPage() {
  return (
    <main className="music-soon">
      <div className="music-soon__inner">
        {/* Decorative ring */}
        <div className="music-soon__ring" aria-hidden="true">
          <div className="music-soon__ring-inner" />
        </div>

        {/* Icon */}
        <div className="music-soon__icon" aria-hidden="true">
          {/* Simple vinyl / note SVG — no external dependency */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="24"
              cy="24"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
            {/* Vinyl grooves */}
            <circle
              cx="24"
              cy="24"
              r="14"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="2 3"
              opacity="0.4"
            />
            <circle
              cx="24"
              cy="24"
              r="10"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="2 3"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Copy */}
        <p className="music-soon__label">Coming Soon</p>
        <h1 className="music-soon__heading">Music</h1>
        <p className="music-soon__body">
          Reviews, ratings, and hype scores for albums and tracks are on their
          way.
          <br />
          Stay tuned.
        </p>
      </div>

      <style jsx>{`
        .music-soon {
          /* Full viewport height minus the 64px fixed header */
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .music-soon__inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          /* Subtle upward offset so it feels visually centred */
          margin-top: -32px;
        }

        /* Outer pulsing ring */
        .music-soon__ring {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(192, 0, 26, 0.25);
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .music-soon__ring-inner {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid rgba(192, 0, 26, 0.15);
        }

        @keyframes ring-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(192, 0, 26, 0.15);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(192, 0, 26, 0);
          }
        }

        .music-soon__icon {
          position: absolute;
          color: var(--color-kritiq-ember, #e8001f);
        }

        .music-soon__label {
          font-family: var(--font-lexend);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-kritiq-ember, #e8001f);
          margin: 0;
          margin-top: 8px;
        }

        .music-soon__heading {
          font-family: var(--font-clash);
          font-size: clamp(2.5rem, 8vw, 4rem);
          font-weight: 700;
          color: var(--color-kritiq-white, #f5f5f5);
          margin: 0;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .music-soon__body {
          font-family: var(--font-lexend);
          font-size: 14px;
          line-height: 1.7;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
          max-width: 320px;
        }
      `}</style>
    </main>
  );
}
