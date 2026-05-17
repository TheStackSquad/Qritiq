// client/src/components/topRated/topRatedUI/streetPullLeaderboard.js
"use client";

/**
 * StreetPullLeaderboard
 * Ranked list of content by street_pull_score.
 * Amber accent, scroll-triggered row cascade via IntersectionObserver.
 * Score bar fills on first visibility — CSS transition, no JS libraries.
 *
 * Top 3 get a crown treatment (🥇🥈🥉).
 * Toggle between combined / movies / music.
 *
 * Low bandwidth:
 *  - Thumbnails are 44px — tiny request, explicit sizes prop
 *  - IntersectionObserver fires fill only when row is visible
 *  - No animation library — CSS transition + will-change: width
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  //Star
} from "lucide-react";
import { useLeaderboard } from "../../../utils/hooks/useArena";
import { LeaderboardSkeleton } from "./arenaSkeletons";
import { getPosterUrl } from "../../../services/cloudinary/upload/urlBuilders";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "movie", label: "🎬 Movies" },
  { value: "music", label: "🎵 Music" },
];

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, maxScore, animate }) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div
      className="sb-track"
      role="meter"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="sb-fill" style={{ width: animate ? `${pct}%` : "0%" }} />
      <style jsx>{`
        .sb-track {
          height: 4px;
          border-radius: 99px;
          background: var(--color-kritiq-dark-3, #1e1e1e);
          overflow: hidden;
        }
        .sb-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 99px;
          will-change: width;
          transition: width 600ms cubic-bezier(0.34, 1.1, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────

function LeaderboardRow({ entry, index, maxScore }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const href =
    entry.content_type === "movie"
      ? `/movies/${entry.slug}`
      : `/music/${entry.slug}`;

  const medal = RANK_MEDAL[index] ?? null;
  const isTop3 = index < 3;

  return (
    <div
      ref={ref}
      className={`lr-root ${visible ? "lr-root--in" : ""} ${isTop3 ? "lr-root--top3" : ""}`}
      style={{ transitionDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      {/* Rank */}
      <div className="lr-rank" aria-label={`Rank ${entry.rank}`}>
        {medal ?? <span className="lr-rank-num">{entry.rank}</span>}
      </div>

      {/* Thumbnail */}
      <Link
        href={href}
        className="lr-thumb-link"
        tabIndex={-1}
        aria-label={`View ${entry.title}`}
      >
        <div className="lr-thumb">
          {entry.image_url ? (
            <Image
              src={getPosterUrl(entry.image_url, { width: 40, height: 52 }).src}
              alt={entry.title}
              fill
              sizes="44px"
              className="lr-img"
              loading="lazy"
            />
          ) : (
            <div className="lr-thumb-fallback" aria-hidden="true">
              {entry.content_type === "movie" ? "🎬" : "🎵"}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="lr-info">
        <Link href={href} className="lr-title-link">
          <p className="lr-title">{entry.title}</p>
        </Link>
        {entry.genre && <p className="lr-genre">{entry.genre}</p>}
        <ScoreBar
          score={entry.street_pull_score}
          maxScore={maxScore}
          animate={visible}
        />
      </div>

      {/* Score + type */}
      <div className="lr-right">
        <div
          className="lr-score"
          aria-label={`Street Pull score ${Math.round(entry.street_pull_score)}`}
        >
          <Flame size={10} strokeWidth={2.5} aria-hidden="true" />
          {Math.round(entry.street_pull_score)}
        </div>
        <span className={`lr-type lr-type--${entry.content_type}`}>
          {entry.content_type === "movie" ? "Film" : "Music"}
        </span>
      </div>

      <style jsx>{`
        .lr-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          opacity: 0;
          transform: translateX(-8px);
          transition:
            opacity 250ms ease,
            transform 250ms ease,
            background 150ms ease;
        }
        .lr-root--in {
          opacity: 1;
          transform: translateX(0);
        }
        .lr-root--top3 {
          background: var(--color-kritiq-dark-1, #111);
          border: 0.5px solid rgba(245, 158, 11, 0.15);
        }
        .lr-root:hover {
          background: var(--color-kritiq-dark-1, #111);
        }

        .lr-rank {
          width: 26px;
          text-align: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .lr-rank-num {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-kritiq-ash, #666);
        }

        .lr-thumb-link {
          display: block;
          flex-shrink: 0;
        }
        .lr-thumb {
          position: relative;
          width: 40px;
          height: 52px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .lr-img {
          object-fit: cover;
        }
        .lr-thumb-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .lr-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .lr-title-link {
          text-decoration: none;
        }
        .lr-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-kritiq-white, #fff);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lr-title-link:hover .lr-title {
          color: #f59e0b;
        }
        .lr-genre {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          color: var(--color-kritiq-ash, #666);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lr-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .lr-score {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          color: #f59e0b;
        }
        .lr-type {
          font-family: var(--font-lexend, sans-serif);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 99px;
        }
        .lr-type--movie {
          background: rgba(192, 0, 26, 0.1);
          color: var(--color-kritiq-red, #c0001a);
        }
        .lr-type--music {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StreetPullLeaderboard() {
  const [activeType, setActiveType] = useState("");
  const { data: entries = [], isLoading } = useLeaderboard(activeType);

  const maxScore =
    entries.length > 0
      ? Math.max(...entries.map((e) => e.street_pull_score))
      : 1;

  return (
    <section aria-labelledby="leaderboard-heading">
      {/* Section header */}
      <div className="sl-header">
        <h2 id="leaderboard-heading" className="sl-title">
          Street Pull
        </h2>
        <p className="sl-sub">What the streets are actually engaging with</p>
      </div>

      {/* Type filter */}
      <div
        className="sl-tabs"
        role="tablist"
        aria-label="Filter leaderboard by content type"
      >
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeType === tab.value}
            className={`sl-tab ${activeType === tab.value ? "sl-tab--active" : ""}`}
            onClick={() => setActiveType(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <LeaderboardSkeleton count={8} />
      ) : entries.length === 0 ? (
        <p className="sl-empty">No data yet — be the first to vote.</p>
      ) : (
        <div className="sl-list" role="list">
          {entries.map((entry, i) => (
            <div key={entry.content_id} role="listitem">
              <LeaderboardRow entry={entry} index={i} maxScore={maxScore} />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sl-header {
          padding: 0 16px 12px;
        }
        .sl-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 22px;
          font-weight: 800;
          color: var(--color-kritiq-white, #fff);
          margin: 0 0 4px;
        }
        .sl-sub {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }

        .sl-tabs {
          display: flex;
          gap: 6px;
          padding: 0 16px 14px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .sl-tabs::-webkit-scrollbar {
          display: none;
        }

        .sl-tab {
          flex-shrink: 0;
          padding: 6px 14px;
          border-radius: 99px;
          border: 0.5px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .sl-tab:focus-visible {
          outline: 2px solid #f59e0b;
          outline-offset: 2px;
        }
        .sl-tab--active {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .sl-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sl-empty {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          color: var(--color-kritiq-ash, #666);
          text-align: center;
          padding: 40px 16px;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
