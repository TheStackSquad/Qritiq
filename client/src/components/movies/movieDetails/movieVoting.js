// src/components/movies/movieDetails/movieVoting.js
"use client";

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Flame,
  Meh,
  TrendingDown,
  Drama,
  Clapperboard,
  Music2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useEngage } from "@/utils/hooks/useEngagement";
import useAuthStore from "@/sessions/userSessions";
import AuthGate from "@/components/auth/authGate";
import MovieStarRating from "./movieStarRatings";

// ─── Config ───────────────────────────────────────────────────────────────────

const HYPE_VOTES = [
  { value: "hype", label: "Hyped", icon: Flame, color: "var(--color-hype)" },
  { value: "meh", label: "Meh", icon: Meh, color: "var(--color-kritiq-ash)" },
  { value: "flop", label: "Flop", icon: TrendingDown, color: "#EF4444" },
];

const PRE_RELEASE_BUTTONS = [
  { value: "looks_promising", label: "Looks Promising", icon: Sparkles },
  { value: "great_trailer", label: "Great Trailer", icon: Clapperboard },
  { value: "cant_wait", label: "Can't Wait", icon: Flame },
  { value: "overhyped", label: "Overhyped", icon: AlertTriangle },
  { value: "risky_cast", label: "Risky Cast", icon: Drama },
  { value: "bold_concept", label: "Bold Concept", icon: Music2 },
];

const RELEASED_BUTTONS = [
  { value: "plot", label: "Great Plot", icon: Drama },
  { value: "acting", label: "Great Acting", icon: Clapperboard },
  { value: "soundtrack", label: "Soundtrack 🔥", icon: Music2 },
  { value: "visuals", label: "Stunning Visuals", icon: Sparkles },
  { value: "predictable", label: "Too Predictable", icon: AlertTriangle },
  { value: "slow", label: "Slow Paced", icon: Meh },
];

// ─── Like / Dislike bar ───────────────────────────────────────────────────────

function LikeBar({ movie, engagement, onAuthRequired }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const engage = useEngage();

  const liked = engagement?.has_liked ?? false;
  const disliked = engagement?.has_disliked ?? false;

  function handleLike() {
    if (!isAuthenticated) {
      onAuthRequired("Sign in to like this movie.");
      return;
    }
    engage.mutate({
      contentId: movie.id,
      contentType: "movie",
      engagementType: "like",
      slug: movie.slug,
    });
  }

  function handleDislike() {
    if (!isAuthenticated) {
      onAuthRequired("Sign in to vote.");
      return;
    }
    engage.mutate({
      contentId: movie.id,
      contentType: "movie",
      engagementType: "dislike",
      slug: movie.slug,
    });
  }

  const likeCount = (movie.total_likes ?? 0) + (liked ? 0 : 0); // server is source of truth

  return (
    <div className="mv-like-bar">
      <button
        className={`mv-like-btn ${liked ? "mv-like-btn--active" : ""}`}
        onClick={handleLike}
        aria-label="Like"
        disabled={engage.isPending}
      >
        <ThumbsUp size={15} strokeWidth={2} />
        <span>{likeCount.toLocaleString()}</span>
      </button>

      <div className="mv-divider" />

      <button
        className={`mv-like-btn mv-like-btn--dislike ${disliked ? "mv-like-btn--dislike-active" : ""}`}
        onClick={handleDislike}
        aria-label="Dislike"
        disabled={engage.isPending}
      >
        <ThumbsDown size={15} strokeWidth={2} />
      </button>

      <style jsx>{`
        .mv-like-bar {
          display: flex;
          align-items: center;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: var(--color-kritiq-dark-1);
          overflow: hidden;
          width: fit-content;
        }
        .mv-like-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-kritiq-ash);
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          transition:
            color 150ms ease,
            background 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mv-like-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .mv-like-btn:hover {
          background: var(--color-kritiq-dark-2);
        }
        .mv-like-btn--active {
          color: #22c55e;
        }
        .mv-like-btn--dislike {
          padding: 10px 14px;
        }
        .mv-like-btn--dislike-active {
          color: #ef4444;
        }
        .mv-divider {
          width: 1px;
          height: 20px;
          background: var(--color-kritiq-dark-3);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

// ─── Main voting panel ────────────────────────────────────────────────────────

export default function MovieVoting({ movie, engagement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const engage = useEngage();

  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateMessage, setAuthGateMessage] = useState("");
  const [ratingVotes, setRatingVotes] = useState([]);

  const currentHypeVote = engagement?.hype_vote ?? "";

  function requireAuth(message) {
    setAuthGateMessage(message);
    setAuthGateOpen(true);
  }

  function handleHype(value) {
    if (!isAuthenticated) {
      requireAuth("Sign in to cast your hype vote.");
      return;
    }
    engage.mutate({
      contentId: movie.id,
      contentType: "movie",
      engagementType: value,
      slug: movie.slug,
    });
  }

  function toggleDimension(value) {
    if (!isAuthenticated) {
      requireAuth("Sign in to vote on what stood out.");
      return;
    }
    setRatingVotes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  const dimensionButtons =
    movie.status === "pre_release" ? PRE_RELEASE_BUTTONS : RELEASED_BUTTONS;

  return (
    <>
      <div className="mv-root">
        {/* ── Like / Dislike ───────────────────────────────────── */}
        <LikeBar
          movie={movie}
          engagement={engagement}
          onAuthRequired={requireAuth}
        />

        {/* ── Hype vote ────────────────────────────────────────── */}
        <div className="mv-section">
          <p className="mv-section-label">
            {movie.status === "pre_release"
              ? "Are you hyped?"
              : "Was it worth the hype?"}
          </p>
          <div className="mv-hype-row">
            {HYPE_VOTES.map((v) => {
              const active = currentHypeVote === v.value;
              return (
                <button
                  key={v.value}
                  className={`mv-hype-btn ${active ? "mv-hype-btn--active" : ""}`}
                  style={active ? { borderColor: v.color, color: v.color } : {}}
                  onClick={() => handleHype(v.value)}
                  disabled={engage.isPending}
                >
                  <v.icon size={14} strokeWidth={2} />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Star rating — released movies only ───────────────── */}
        {movie.status === "released" && (
          <MovieStarRating
            movie={movie}
            engagement={engagement}
            onAuthRequired={requireAuth}
          />
        )}

        {/* ── Dimension buttons ─────────────────────────────────── */}
        <div className="mv-section">
          <p className="mv-section-label">
            {movie.status === "pre_release"
              ? "First impressions?"
              : "What stood out?"}
          </p>
          <div className="mv-rating-grid">
            {dimensionButtons.map((b) => {
              const active = ratingVotes.includes(b.value);
              return (
                <button
                  key={b.value}
                  className={`mv-rating-btn ${active ? "mv-rating-btn--active" : ""}`}
                  onClick={() => toggleDimension(b.value)}
                >
                  <b.icon size={13} strokeWidth={2} />
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Auth gate ─────────────────────────────────────────────── */}
      <AuthGate
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        message={authGateMessage}
      />

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .mv-root {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Section ──────────────────────────────────────────── */

        .mv-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mv-section-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }

        /* ── Hype buttons ─────────────────────────────────────── */

        .mv-hype-row {
          display: flex;
          gap: 8px;
        }

        .mv-hype-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: var(--color-kritiq-dark-1);
          color: var(--color-kritiq-ash);
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mv-hype-btn:hover {
          background: var(--color-kritiq-dark-2);
        }
        .mv-hype-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .mv-hype-btn--active {
          background: rgba(192, 0, 26, 0.08);
        }

        /* ── Dimension grid ───────────────────────────────────── */

        .mv-rating-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .mv-rating-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 14px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: var(--color-kritiq-dark-1);
          color: var(--color-kritiq-ash);
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
          text-align: left;
        }

        .mv-rating-btn:hover {
          background: var(--color-kritiq-dark-2);
          color: var(--color-kritiq-silver);
        }

        .mv-rating-btn--active {
          background: rgba(192, 0, 26, 0.1);
          border-color: rgba(192, 0, 26, 0.4);
          color: var(--color-kritiq-white);
        }
      `}</style>
    </>
  );
}
