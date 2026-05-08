// client/src/components/musicDetails/musicVoting.js

"use client";

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Flame,
  Meh,
  TrendingDown,
  Mic2,
  Music2,
  Sparkles,
  AlertTriangle,
  Radio,
  Headphones,
  Zap,
} from "lucide-react";
import { useEngage } from "../../../utils/hooks/useEngagement";
import useAuthStore from "../../../sessions/userSessions";
import AuthGate from "../../../components/auth/authGate";
import MusicStarRating from "./musicStarRating";

// ─── Config ───────────────────────────────────────────────────────────────────

const HYPE_VOTES = [
  { value: "hype", label: "Hyped", icon: Flame, color: "#f59e0b" },
  { value: "meh", label: "Meh", icon: Meh, color: "var(--color-kritiq-ash)" },
  { value: "flop", label: "Flop", icon: TrendingDown, color: "#ef4444" },
];

// Pre-release — before track drops
const PRE_RELEASE_BUTTONS = [
  { value: "fire_artist", label: "Fire Artist", icon: Flame },
  { value: "great_snippet", label: "Great Snippet", icon: Headphones },
  { value: "cant_wait", label: "Can't Wait", icon: Zap },
  { value: "overhyped", label: "Overhyped", icon: AlertTriangle },
  { value: "bad_timing", label: "Bad Timing", icon: Radio },
  { value: "bold_sound", label: "Bold Sound", icon: Music2 },
];

// Post-release — after track drops
const RELEASED_BUTTONS = [
  { value: "lyrics", label: "Hard Lyrics", icon: Mic2 },
  { value: "production", label: "Crazy Prod", icon: Sparkles },
  { value: "chorus", label: "Chorus Slaps", icon: Music2 },
  { value: "vibe", label: "Pure Vibe", icon: Headphones },
  { value: "repetitive", label: "Too Repetitive", icon: AlertTriangle },
  { value: "no_replay", label: "No Replay Value", icon: TrendingDown },
];

// ─── Like / Dislike bar ───────────────────────────────────────────────────────

function LikeBar({ track, engagement, onAuthRequired }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const engage = useEngage();

  const liked = engagement?.has_liked ?? false;
  const disliked = engagement?.has_disliked ?? false;

  function handleLike() {
    if (!isAuthenticated) {
      onAuthRequired("Sign in to like this track.");
      return;
    }
    engage.mutate({
      contentId: track.id,
      contentType: "music",
      engagementType: "like",
      slug: track.slug,
    });
  }
  function handleDislike() {
    if (!isAuthenticated) {
      onAuthRequired("Sign in to vote.");
      return;
    }
    engage.mutate({
      contentId: track.id,
      contentType: "music",
      engagementType: "dislike",
      slug: track.slug,
    });
  }

  return (
    <div className="mlb-root">
      <button
        className={`mlb-btn ${liked ? "mlb-btn--liked" : ""}`}
        onClick={handleLike}
        aria-label="Like"
        disabled={engage.isPending}
      >
        <ThumbsUp size={15} strokeWidth={2} />
        <span>{(track.total_likes ?? 0).toLocaleString()}</span>
      </button>
      <div className="mlb-divider" />
      <button
        className={`mlb-btn mlb-btn--dis ${disliked ? "mlb-btn--disliked" : ""}`}
        onClick={handleDislike}
        aria-label="Dislike"
        disabled={engage.isPending}
      >
        <ThumbsDown size={15} strokeWidth={2} />
      </button>
      <style jsx>{`
        .mlb-root {
          display: flex;
          align-items: center;
          border-radius: var(--radius-pill, 99px);
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          overflow: hidden;
          width: fit-content;
        }
        .mlb-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          transition:
            color 150ms ease,
            background 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mlb-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .mlb-btn:hover {
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .mlb-btn--liked {
          color: #22c55e;
        }
        .mlb-btn--dis {
          padding: 10px 14px;
        }
        .mlb-btn--disliked {
          color: #ef4444;
        }
        .mlb-divider {
          width: 1px;
          height: 20px;
          background: var(--color-kritiq-dark-3, #2a2a2a);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

// ─── Main voting panel ────────────────────────────────────────────────────────

export default function MusicVoting({ track, engagement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const engage = useEngage();

  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateMessage, setAuthGateMessage] = useState("");
  const [ratingVotes, setRatingVotes] = useState([]);

  const currentHypeVote = engagement?.hype_vote ?? "";
  const dimensionButtons =
    track.status === "pre_release" ? PRE_RELEASE_BUTTONS : RELEASED_BUTTONS;

  function requireAuth(msg) {
    setAuthGateMessage(msg);
    setAuthGateOpen(true);
  }

  function handleHype(value) {
    if (!isAuthenticated) {
      requireAuth("Sign in to cast your hype vote.");
      return;
    }
    engage.mutate({
      contentId: track.id,
      contentType: "music",
      engagementType: value,
      slug: track.slug,
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

  return (
    <>
      <div className="mv-root">
        {/* Like / Dislike */}
        <LikeBar
          track={track}
          engagement={engagement}
          onAuthRequired={requireAuth}
        />

        {/* Hype vote */}
        <div className="mv-section">
          <p className="mv-section-label">
            {track.status === "pre_release"
              ? "Is this one gon' slap?"
              : "Did it actually slap?"}
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

        {/* Star rating — released only */}
        {track.status === "released" && (
          <MusicStarRating
            track={track}
            engagement={engagement}
            onAuthRequired={requireAuth}
          />
        )}

        {/* Dimension buttons */}
        <div className="mv-section">
          <p className="mv-section-label">
            {track.status === "pre_release"
              ? "First impressions?"
              : "What stood out?"}
          </p>
          <div className="mv-dim-grid">
            {dimensionButtons.map((b) => {
              const active = ratingVotes.includes(b.value);
              return (
                <button
                  key={b.value}
                  className={`mv-dim-btn ${active ? "mv-dim-btn--active" : ""}`}
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

      <AuthGate
        isOpen={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        message={authGateMessage}
      />

      <style jsx>{`
        .mv-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .mv-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mv-section-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
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
          border-radius: var(--radius-pill, 99px);
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .mv-hype-btn:hover {
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .mv-hype-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .mv-hype-btn--active {
          background: rgba(245, 158, 11, 0.08);
        }

        .mv-dim-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .mv-dim-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 14px;
          border-radius: var(--radius-pill, 99px);
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
          text-align: left;
        }
        .mv-dim-btn:hover {
          background: var(--color-kritiq-dark-2, #1a1a1a);
          color: var(--color-kritiq-silver, #ccc);
        }
        .mv-dim-btn--active {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }
      `}</style>
    </>
  );
}
