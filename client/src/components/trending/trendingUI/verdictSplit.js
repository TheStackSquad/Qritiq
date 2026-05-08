// src/components/trending/trendingUI/verdictSplit.js
"use client";

import { VERDICT_SPLIT_SEED } from "../../../data/seedData";
import { TrendingSkeleton, TrendingError } from "./trendingStates";

function getVerdict(gap) {
  if (gap > 10)
    return {
      text: "Streets rate it higher",
      color: "#FF4433",
      accent: "#FF4433",
    };
  if (gap < -10)
    return {
      text: "Critics rate it higher",
      color: "#F59E0B",
      accent: "#F59E0B",
    };
  return { text: "Both sides agree", color: "#22C55E", accent: "#22C55E" };
}

function FaceoffBar({ criticScore, streetScore }) {
  // Single track — critics from left, street from left too.
  // The overlap or gap between the two scores is the story.
  const max = Math.max(criticScore, streetScore);
  const min = Math.min(criticScore, streetScore);
  const winner = streetScore >= criticScore ? "street" : "critic";

  return (
    <div className="faceoff-bar-wrap" aria-hidden="true">
      {/* Base track */}
      <div className="bar-track">
        {/* Critic fill */}
        <div
          className="bar-fill critic-fill"
          style={{ width: `${criticScore}%` }}
        />
        {/* Street fill — slightly translucent over critic if overlapping */}
        <div
          className="bar-fill street-fill"
          style={{ width: `${streetScore}%` }}
        />
        {/* Gap highlight — the zone between min and max */}
        <div
          className="gap-zone"
          style={{
            left: `${min}%`,
            width: `${max - min}%`,
            background:
              winner === "street"
                ? "rgba(255,68,51,0.15)"
                : "rgba(245,158,11,0.15)",
          }}
        />
      </div>
      <style jsx>{`
        .faceoff-bar-wrap {
          padding: 4px 0 2px;
        }
        .bar-track {
          position: relative;
          height: 6px;
          background: var(--color-kritiq-dark-3);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 4px;
          transition: width 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: width;
        }
        .critic-fill {
          background: #f59e0b;
          opacity: 0.7;
        }
        .street-fill {
          background: #ff4433;
          opacity: 0.9;
        }
        .gap-zone {
          position: absolute;
          top: 0;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

function VerdictCard({ item, index }) {
  const gap = Math.round(item.streetScore - item.criticScore);
  const verdict = getVerdict(gap);
  const absGap = Math.abs(gap);

  return (
    <article
      className="verdict-card"
      style={{
        animationDelay: `${index * 60}ms`,
        borderLeftColor: verdict.accent,
      }}
    >
      {/* ── Top row: title + gap badge ── */}
      <div className="card-top">
        <div className="title-block">
          <p className="verdict-title">{item.title}</p>
          <p className="verdict-meta">
            <span
              className="status-dot"
              style={{
                background:
                  item.status === "pre_release" ? "#FF4433" : "#22C55E",
              }}
            />
            {item.status === "pre_release" ? "Pre-release" : "Released"}
            {" · "}
            {item.totalVotes.toLocaleString()} votes
          </p>
        </div>

        <div
          className="gap-badge"
          style={{
            color: verdict.color,
            borderColor: verdict.color + "30",
            background: verdict.color + "10",
          }}
        >
          {gap > 0 ? "+" : ""}
          {gap}
        </div>
      </div>

      {/* ── Score face-off ── */}
      <div className="scores-row">
        <div className="score-side">
          <span className="score-label">Critics</span>
          <span className="score-num critic-num">
            {Math.round(item.criticScore)}
          </span>
        </div>

        <div className="vs-divider">
          <span className="vs-text">vs</span>
        </div>

        <div className="score-side score-side--right">
          <span className="score-label">The Street</span>
          <span className="score-num street-num">
            {Math.round(item.streetScore)}
          </span>
        </div>
      </div>

      {/* ── Dual bar ── */}
      <FaceoffBar
        criticScore={item.criticScore}
        streetScore={item.streetScore}
      />

      {/* ── Legend + verdict ── */}
      <div className="card-footer">
        <div className="bar-legend">
          <span className="legend-dot critic-dot" />
          <span className="legend-text">Critics</span>
          <span className="legend-dot street-dot" />
          <span className="legend-text">Street</span>
        </div>
        <p className="verdict-text" style={{ color: verdict.color }}>
          {absGap > 0 ? `${absGap}pt — ` : ""}
          {verdict.text}
        </p>
      </div>

      <style jsx>{`
        .verdict-card {
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-left: 3px solid;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: slideUp 0.35s ease-out both;
          /* Low-bandwidth: skip animation if user prefers reduced motion */
          content-visibility: auto;
          contain-intrinsic-size: 0 140px;
        }
        @media (prefers-reduced-motion: reduce) {
          .verdict-card {
            animation: none;
          }
        }
        .verdict-card:hover {
          border-top-color: rgba(192, 0, 26, 0.25);
          border-right-color: rgba(192, 0, 26, 0.25);
          border-bottom-color: rgba(192, 0, 26, 0.25);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .title-block {
          flex: 1;
          min-width: 0;
        }
        .verdict-title {
          font-family: var(--font-lexend);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-kritiq-white);
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .verdict-meta {
          font-family: var(--font-gilroy);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .gap-badge {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .scores-row {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .score-side {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .score-side--right {
          align-items: flex-end;
        }
        .score-label {
          font-family: var(--font-gilroy);
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
        }
        .score-num {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .critic-num {
          color: #f59e0b;
        }
        .street-num {
          color: #ff4433;
        }
        .vs-divider {
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vs-text {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          color: var(--color-kritiq-dark-3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .bar-legend {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-dot {
          width: 8px;
          height: 3px;
          border-radius: 2px;
          display: inline-block;
          flex-shrink: 0;
        }
        .critic-dot {
          background: #f59e0b;
        }
        .street-dot {
          background: #ff4433;
        }
        .legend-text {
          font-family: var(--font-gilroy);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          margin-right: 4px;
        }
        .verdict-text {
          font-family: var(--font-gilroy);
          font-size: 11px;
          font-weight: 600;
          margin: 0;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </article>
  );
}

export default function VerdictSplit({ movies, isLoading, isError }) {
  if (isLoading) return <TrendingSkeleton />;
  if (isError) return <TrendingError />;

  const data = movies?.length ? movies : VERDICT_SPLIT_SEED;

  return (
    <section
      className="verdict-section"
      aria-label="Verdict Split — Critics vs The Street"
    >
      <header className="section-header">
        <div>
          <h2 className="section-title">The Verdict Split</h2>
          <p className="section-sub">
            Critics vs The Street — who sees it differently?
          </p>
        </div>
      </header>

      <div className="verdict-list" role="list">
        {data.map((item, i) => (
          <VerdictCard key={item.id} item={item} index={i} />
        ))}
      </div>

      <style jsx>{`
        .verdict-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
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
        .verdict-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </section>
  );
}
