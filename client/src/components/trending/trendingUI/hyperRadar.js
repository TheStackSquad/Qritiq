// src/components/trending/trendingUI/hypeRadar.js
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { HYPE_RADAR_SEED } from "@/data/seedData";
import { TrendingSkeleton, TrendingError } from "./trendingStates";

// ── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({ delta }) {
  if (delta > 0)
    return (
      <span className="delta rising">
        <TrendingUp size={11} strokeWidth={2.5} />+{delta}%
        <style jsx>{`
          .delta {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
            flex-shrink: 0;
          }
          .rising {
            color: #ff4433;
            background: rgba(255, 68, 51, 0.1);
          }
        `}</style>
      </span>
    );
  if (delta < 0)
    return (
      <span className="delta falling">
        <TrendingDown size={11} strokeWidth={2.5} />
        {delta}%
        <style jsx>{`
          .delta {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
            flex-shrink: 0;
          }
          .falling {
            color: #6b6b72;
            background: rgba(107, 107, 114, 0.1);
          }
        `}</style>
      </span>
    );
  return (
    <span className="delta flat">
      <Minus size={11} strokeWidth={2.5} />
      0%
      <style jsx>{`
        .delta {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .flat {
          color: var(--color-kritiq-ash);
          background: var(--color-kritiq-dark-2);
        }
      `}</style>
    </span>
  );
}

// ── Score ring SVG ────────────────────────────────────────────────────────────
// r=14, circumference = 2π×14 ≈ 87.96 → we use 88

function ScoreRing({ score, isRising, isFalling }) {
  const stroke = isRising ? "#FF4433" : isFalling ? "#6B6B72" : "#F59E0B";
  const dashFill = (score / 100) * 88;

  return (
    <div className="score-ring" aria-label={`Score: ${Math.round(score)}`}>
      <svg width="40" height="40" viewBox="0 0 36 36" aria-hidden="true">
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="var(--color-kritiq-dark-3)"
          strokeWidth="2.5"
        />
        {/* Fill */}
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dashFill} 88`}
          transform="rotate(-90 18 18)"
          className={isRising ? "ring-fill-rising" : ""}
        />
      </svg>
      <span className="ring-score">{Math.round(score)}</span>

      <style jsx>{`
        .score-ring {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        .ring-score {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          color: var(--color-kritiq-white);
        }
        .ring-fill-rising {
          filter: drop-shadow(0 0 3px rgba(255, 68, 51, 0.4));
        }
        @media (prefers-reduced-motion: reduce) {
          .ring-fill-rising {
            filter: none;
          }
        }
      `}</style>
    </div>
  );
}

// ── Rank pill ─────────────────────────────────────────────────────────────────

function RankPill({ rank }) {
  const color =
    rank === 1
      ? "#F59E0B"
      : rank === 2
        ? "#9CA3AF"
        : rank === 3
          ? "#CD7F32"
          : "var(--color-kritiq-ash)";

  return (
    <span className="rank-pill" style={{ color }}>
      {rank}
      <style jsx>{`
        .rank-pill {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
          line-height: 1;
        }
      `}</style>
    </span>
  );
}

// ── Momentum bar — visualises delta magnitude beneath title ───────────────────

function MomentumBar({ delta, isRising }) {
  const width = Math.min(Math.abs(delta) * 4, 100); // cap at 100%
  const color = isRising ? "#FF4433" : "#6B6B72";

  return (
    <div className="momentum-wrap" aria-hidden="true">
      <div
        className="momentum-fill"
        style={{ width: `${width}%`, background: color }}
      />
      <style jsx>{`
        .momentum-wrap {
          height: 2px;
          background: var(--color-kritiq-dark-3);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }
        .momentum-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: width;
        }
      `}</style>
    </div>
  );
}

// ── Single row ────────────────────────────────────────────────────────────────

function RadarRow({ item, rank, index }) {
  const isRising = item.weeklyDelta > 0;
  const isFalling = item.weeklyDelta < 0;

  return (
    <article
      className={`radar-row ${isRising ? "rising" : isFalling ? "falling" : "flat"}`}
      style={{ animationDelay: `${index * 55}ms` }}
      aria-label={`${item.title} — rank ${rank}`}
    >
      <RankPill rank={rank} />

      <ScoreRing
        score={item.currentScore}
        isRising={isRising}
        isFalling={isFalling}
      />

      <div className="radar-info">
        <p className="radar-title">{item.title}</p>
        <p className="radar-meta">
          {item.genre}
          {item.genre && " · "}
          {item.totalVotes.toLocaleString()} votes
        </p>
        <MomentumBar delta={item.weeklyDelta} isRising={isRising} />
      </div>

      <DeltaBadge delta={item.weeklyDelta} />

      <style jsx>{`
        .radar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--color-kritiq-dark-3);
          border-left: 3px solid transparent;
          background: var(--color-kritiq-dark-1);
          animation: slideUp 0.35s ease-out both;
          content-visibility: auto;
          contain-intrinsic-size: 0 66px;
          transition:
            border-color 0.15s,
            background 0.15s;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .radar-row {
            animation: none;
          }
        }
        .radar-row:hover {
          background: var(--color-kritiq-dark-2);
        }
        .radar-row.rising {
          border-left-color: #ff4433;
        }
        .radar-row.falling {
          border-left-color: #6b6b72;
        }
        .radar-row.flat {
          border-left-color: var(--color-kritiq-dark-3);
        }
        .radar-info {
          flex: 1;
          min-width: 0;
        }
        .radar-title {
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-kritiq-white);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .radar-meta {
          font-family: var(--font-gilroy);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </article>
  );
}

// ── Group header ──────────────────────────────────────────────────────────────

function GroupLabel({ isRising }) {
  return (
    <p className={`group-label ${isRising ? "rising-label" : "falling-label"}`}>
      <span className="group-icon" aria-hidden="true">
        {isRising ? (
          <TrendingUp size={13} strokeWidth={2.5} />
        ) : (
          <TrendingDown size={13} strokeWidth={2.5} />
        )}
      </span>
      {isRising ? "Rising Fast" : "Cooling Down"}

      <style jsx>{`
        .group-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 6px;
        }
        .rising-label {
          color: #ff4433;
        }
        .falling-label {
          color: var(--color-kritiq-ash);
        }
        .group-icon {
          display: inline-flex;
          align-items: center;
        }
      `}</style>
    </p>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function HypeRadar({ movies, isLoading, isError, onRetry }) {
  if (isLoading) return <TrendingSkeleton rows={6} />;
  if (isError) return <TrendingError onRetry={onRetry} />;

  const data = movies?.length ? movies : HYPE_RADAR_SEED;

  const rising = data
    .filter((m) => m.weeklyDelta > 0)
    .sort((a, b) => b.weeklyDelta - a.weeklyDelta);

  const falling = data
    .filter((m) => m.weeklyDelta < 0) // strict — excludes flat (delta=0)
    .sort((a, b) => a.weeklyDelta - b.weeklyDelta);

  const hasData = rising.length > 0 || falling.length > 0;

  return (
    <section
      className="radar-section"
      aria-label="Hype Radar — weekly momentum"
    >
      {/* Header */}
      <header className="section-header">
        <div>
          <h2 className="section-title">Hype Radar</h2>
          <p className="section-sub">
            What&apos;s gaining momentum — and what&apos;s cooling off
          </p>
        </div>
        <span className="week-badge" aria-label="Data period: This Week">
          This Week
        </span>
      </header>

      {/* Empty state — all deltas are zero (no snapshot data yet) */}
      {!hasData && (
        <p className="empty-state">
          Not enough weekly data yet — check back soon.
        </p>
      )}

      {/* Rising */}
      {rising.length > 0 && (
        <div className="radar-group">
          <GroupLabel isRising />
          <div className="radar-list" role="list">
            {rising.map((item, i) => (
              <RadarRow key={item.id} item={item} rank={i + 1} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Falling */}
      {falling.length > 0 && (
        <div className="radar-group">
          <GroupLabel isRising={false} />
          <div className="radar-list" role="list">
            {falling.map((item, i) => (
              <RadarRow key={item.id} item={item} rank={i + 1} index={i} />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .radar-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .section-title {
          font-family: var(--font-clash);
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 700;
          color: var(--color-kritiq-white);
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }
        .section-sub {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
        .week-badge {
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(192, 0, 26, 0.1);
          color: var(--color-kritiq-ember);
          border: 1px solid rgba(192, 0, 26, 0.2);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .radar-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .radar-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .empty-state {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          text-align: center;
          padding: 32px 0;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
