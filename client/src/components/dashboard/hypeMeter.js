"use client";

// client/components/dashboard/HypeMeter.js
// Big bold circular SVG gauge — the centrepiece of the partner dashboard.
// Score is 0-100. Animates on mount.

import { useEffect, useRef } from "react";

const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getArcColor(score) {
  if (score >= 75) return "#FF4433"; // hot — kritiq ember
  if (score >= 50) return "#F59E0B"; // warm — warning amber
  return "#6B6B72"; // cold — ash grey
}

function getLabel(score) {
  if (score >= 80) return "Highly Hyped";
  if (score >= 60) return "Building Buzz";
  if (score >= 40) return "Mixed Signals";
  return "Low Hype";
}

export default function HypeMeter({
  score = 0,
  totalVotes = 0,
  label = "Pre-Release Sentiment",
}) {
  const circleRef = useRef(null);
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE;
  const color = getArcColor(clampedScore);

  // Animate the arc on mount
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    // Start from empty
    el.style.strokeDashoffset = String(CIRCUMFERENCE);
    el.style.transition = "none";
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition =
          "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
        el.style.strokeDashoffset = String(offset);
      });
    });
  }, [offset]);

  return (
    <div className="hype-meter-card">
      <p className="widget-label">{label}</p>

      {/* SVG Gauge */}
      <div className="gauge-wrap">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
          aria-label={`Hype score: ${clampedScore}%`}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-kritiq-dark-3)"
            strokeWidth={STROKE}
          />
          {/* Arc */}
          <circle
            ref={circleRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>

        {/* Centre text — overlaid on the SVG */}
        <div className="gauge-centre">
          <span className="gauge-score" style={{ color }}>
            {clampedScore.toFixed(0)}
            <span className="gauge-pct">%</span>
          </span>
          <span className="gauge-verdict">{getLabel(clampedScore)}</span>
        </div>
      </div>

      {/* Vote count */}
      <p className="gauge-votes">
        Based on{" "}
        <strong style={{ color: "var(--color-kritiq-white)" }}>
          {totalVotes.toLocaleString()}
        </strong>{" "}
        {totalVotes === 1 ? "vote" : "votes"}
      </p>

      {/* Sentiment bar — positive / meh / negative breakdown placeholder */}
      <div className="sentiment-row">
        <SentimentPill
          emoji="🔥"
          label="Hyped"
          pct={clampedScore}
          color="#FF4433"
        />
        <SentimentPill
          emoji="😐"
          label="Meh"
          pct={Math.max(0, 100 - clampedScore - 10)}
          color="#6B6B72"
        />
        <SentimentPill
          emoji="💀"
          label="Flop"
          pct={Math.min(10, 100 - clampedScore)}
          color="#3B3B45"
        />
      </div>

      <style jsx>{`
        .hype-meter-card {
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .widget-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
        .gauge-wrap {
          position: relative;
          width: ${SIZE}px;
          height: ${SIZE}px;
        }
        .gauge-centre {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .gauge-score {
          font-family: var(--font-clash);
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .gauge-pct {
          font-size: 24px;
          font-weight: 600;
        }
        .gauge-verdict {
          font-family: var(--font-lexend);
          font-size: 12px;
          color: var(--color-kritiq-ash);
        }
        .gauge-votes {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          margin: 0;
          text-align: center;
        }
        .sentiment-row {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

function SentimentPill({ emoji, label, pct, color }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        flex: 1,
        padding: "8px 6px",
        background: "var(--color-kritiq-dark-2)",
        borderRadius: "var(--radius-badge)",
        border: "1px solid var(--color-kritiq-dark-3)",
      }}
    >
      <span style={{ fontSize: "16px" }}>{emoji}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: 700,
          color,
        }}
      >
        {pct.toFixed(0)}%
      </span>
      <span
        style={{
          fontFamily: "var(--font-lexend)",
          fontSize: "10px",
          color: "var(--color-kritiq-ash)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
