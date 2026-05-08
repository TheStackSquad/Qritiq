// src/components/movies/movieDetails/MovieStarRating.js
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRate } from "../../../utils/hooks/useRate";
import useAuthStore from "../../../sessions/userSessions";

// ─── Star rating ──────────────────────────────────────────────────────────────
// Tap to rate 1–5. Tap active star again to clear.
// Pre-fills from user_engagement.user_rating if already rated.
// Auth-gated — shows AuthGate if unauthenticated.

export default function MovieStarRating({ movie, engagement, onAuthRequired }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const existingRating = engagement?.user_rating ?? null;
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingRating);

  const rate = useRate();
  const pending = rate.isPending;

  function handleSelect(star) {
    if (!isAuthenticated) {
      onAuthRequired("Sign in to rate this movie.");
      return;
    }
    // Tap same star → clear rating (not yet supported by backend — send 0)
    // For now, tapping the same star is a no-op
    if (selected === star) return;

    setSelected(star);
    rate.mutate({
      contentId: movie.id,
      contentType: "movie",
      score: star,
      slug: movie.slug,
    });
  }

  const displayValue = hovered || selected || 0;

  return (
    <div className="msr-root">
      <p className="msr-label">Rate this movie</p>

      <div
        className="msr-stars"
        onMouseLeave={() => setHovered(0)}
        role="group"
        aria-label="Star rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayValue;
          return (
            <button
              key={star}
              className={`msr-star ${filled ? "msr-star--filled" : ""} ${pending ? "msr-star--pending" : ""}`}
              onClick={() => handleSelect(star)}
              onMouseEnter={() => setHovered(star)}
              aria-label={`Rate ${star} out of 5`}
              disabled={pending}
            >
              <Star
                size={28}
                strokeWidth={1.5}
                fill={filled ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="msr-feedback">
          {selected === 1 && "Poor"}
          {selected === 2 && "Below average"}
          {selected === 3 && "Average"}
          {selected === 4 && "Good"}
          {selected === 5 && "Excellent"}
        </p>
      )}

      {rate.isError && <p className="msr-error">Rating failed — try again</p>}

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .msr-root {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          border-radius: var(--radius-card);
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
        }

        /* ── Label ────────────────────────────────────────────── */

        .msr-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }

        /* ── Stars ────────────────────────────────────────────── */

        .msr-stars {
          display: flex;
          gap: 4px;
        }

        .msr-star {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-kritiq-dark-3);
          transition:
            color 120ms ease,
            transform 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .msr-star:hover,
        .msr-star--filled {
          color: #f59e0b;
        }

        .msr-star:active {
          transform: scale(0.88);
        }

        .msr-star--pending {
          opacity: 0.5;
          cursor: wait;
        }

        /* ── Feedback ─────────────────────────────────────────── */

        .msr-feedback {
          font-family: var(--font-lexend);
          font-size: 12px;
          color: #f59e0b;
          font-weight: 600;
          margin: 0;
        }

        .msr-error {
          font-family: var(--font-lexend);
          font-size: 11px;
          color: #ef4444;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
