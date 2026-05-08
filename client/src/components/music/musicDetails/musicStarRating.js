// client/src/components/musicDetails/musicStarRating.js

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRate } from "../../../utils/hooks/useRate";
import useAuthStore from "../../../sessions/userSessions";

export default function MusicStarRating({ track, engagement, onAuthRequired }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const rate = useRate();

  const existingScore = engagement?.rating_score ?? 0;
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(existingScore);

  function handleRate(score) {
    if (!isAuthenticated) {
      onAuthRequired?.("Sign in to rate this track.");
      return;
    }
    rate.mutate(
      { contentId: track.id, contentType: "music", score, slug: track.slug },
      { onSuccess: () => setSubmitted(score) },
    );
  }

  const display = hovered || submitted;

  return (
    <div className="msr-root">
      <p className="msr-label">Rate the Drop</p>
      <div className="msr-stars" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className="msr-star-btn"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={rate.isPending}
          >
            <Star
              size={24}
              strokeWidth={1.5}
              fill={display >= star ? "#f59e0b" : "none"}
              color={
                display >= star
                  ? "#f59e0b"
                  : "var(--color-kritiq-dark-3, #2a2a2a)"
              }
            />
          </button>
        ))}
      </div>
      {submitted > 0 && (
        <p className="msr-confirm">You rated this {submitted}/5 ⭐</p>
      )}
      <p className="msr-aggregate">
        {track.rating_score?.toFixed(1) ?? "—"} avg ·{" "}
        {(track.total_ratings ?? 0).toLocaleString()} ratings
      </p>

      <style jsx>{`
        .msr-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .msr-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
        .msr-stars {
          display: flex;
          gap: 4px;
        }
        .msr-star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: transform 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .msr-star-btn:hover {
          transform: scale(1.15);
        }
        .msr-star-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .msr-confirm {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          color: #f59e0b;
          margin: 0;
        }
        .msr-aggregate {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
