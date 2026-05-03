//client/src/components/dashboard/cityRankCards.js

"use client";

import { useEffect, useState } from "react";

// ─── Seed data for presentation when no real data ─────────────────────────────
const SEED = {
  lagos:         { city: "Lagos",         count: 5124, percentage: 41 },
  abuja:         { city: "Abuja",         count: 2001, percentage: 16 },
  enugu:         { city: "Enugu",         count: 2380, percentage: 19 },
  kano:          { city: "Kano",          count: 1000, percentage: 8  },
  port_harcourt: { city: "Port Harcourt", count: 1250, percentage: 10 },
  other:         { city: "Other",         count:  750, percentage: 6  },
};

// ─── City emoji flags ─────────────────────────────────────────────────────────
const CITY_META = {
  Lagos:         { emoji: "🌊", state: "Lagos State"   },
  Abuja:         { emoji: "🏛️", state: "FCT"           },
  Enugu:         { emoji: "⛏️", state: "Enugu State"   },
  Kano:          { emoji: "🏜️", state: "Kano State"    },
  "Port Harcourt": { emoji: "🛢️", state: "Rivers State" },
  Other:         { emoji: "🗺️", state: "Rest of Nigeria"},
};

// ─── Colour per rank ──────────────────────────────────────────────────────────
const RANK_COLORS = [
  { bar: "#C0001A", glow: "rgba(192,0,26,0.25)",   text: "#FF4433" }, // 1st
  { bar: "#E8001F", glow: "rgba(232,0,31,0.18)",   text: "#FF6B5B" }, // 2nd
  { bar: "#FF4433", glow: "rgba(255,68,51,0.14)",  text: "#FF7A6B" }, // 3rd
  { bar: "#8B0012", glow: "rgba(139,0,18,0.12)",   text: "#B0001A" }, // 4th
  { bar: "#6B6B72", glow: "rgba(107,107,114,0.1)", text: "#8B8B95" }, // 5th
  { bar: "#3A3A42", glow: "rgba(58,58,66,0.08)",   text: "#6B6B72" }, // 6th
];

function RankBadge({ rank }) {
  const medals = ["🥇", "🥈", "🥉"];
  if (rank < 3) return <span className="rank-medal">{medals[rank]}</span>;
  return <span className="rank-num">#{rank + 1}</span>;
}

function CityCard({ entry, rank, animate }) {
  const color  = RANK_COLORS[rank] ?? RANK_COLORS[5];
  const meta   = CITY_META[entry.city] ?? { emoji: "📍", state: "" };
  const pct    = Math.round(entry.percentage);
  const count  = entry.count?.toLocaleString() ?? "0";

  return (
    <div
      className="city-card"
      style={{ "--glow": color.glow, "--bar-color": color.bar }}
    >
      {/* Left: rank + city info */}
      <div className="city-left">
        <RankBadge rank={rank} />
        <div className="city-info">
          <span className="city-emoji">{meta.emoji}</span>
          <div>
            <p className="city-name">{entry.city}</p>
            <p className="city-state">{meta.state}</p>
          </div>
        </div>
      </div>

      {/* Right: percentage + count */}
      <div className="city-right">
        <span className="city-pct" style={{ color: color.text }}>{pct}%</span>
        <span className="city-count">{count} engagements</span>
      </div>

      {/* Animated fill bar */}
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{
            width: animate ? `${pct}%` : "0%",
            background: color.bar,
            boxShadow: `0 0 8px ${color.glow}`,
          }}
        />
      </div>

      <style jsx>{`
        .city-card {
          position: relative;
          background: var(--color-kritiq-dark-2);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: 10px;
          padding: 14px 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }

        .city-card:hover {
          border-color: var(--glow);
          box-shadow: 0 0 0 1px var(--glow);
        }

        /* Subtle left accent stripe */
        .city-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--bar-color);
          border-radius: 10px 0 0 10px;
          opacity: 0.8;
        }

        .city-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .rank-medal {
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
        }

        .rank-num {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          color: var(--color-kritiq-ash);
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .city-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .city-emoji {
          font-size: 20px;
          line-height: 1;
        }

        .city-name {
          font-family: var(--font-lexend);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-kritiq-white);
          margin: 0;
          line-height: 1.2;
        }

        .city-state {
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          margin: 0;
          line-height: 1.2;
        }

        .city-right {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 6px;
          margin-left: auto;
        }

        .city-pct {
          font-family: var(--font-clash);
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }

        .city-count {
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          white-space: nowrap;
        }

        /* Progress bar */
        .bar-track {
          height: 3px;
          background: var(--color-kritiq-dark-3);
          border-radius: 2px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CityRankCards({ demography }) {
  const [animate, setAnimate] = useState(false);

  // Trigger bar animation after mount — one frame delay needed
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Merge real data with seed fallback
  const source = demography ?? SEED;

  // Normalise and sort by percentage descending
  const cities = Object.values(source)
    .filter((d) => d && d.city)
    .sort((a, b) => b.percentage - a.percentage);

  const totalEngagements = cities
    .reduce((sum, d) => sum + (d.count ?? 0), 0)
    .toLocaleString();

  return (
    <div className="crc-wrap">
      {/* Header */}
      <div className="crc-header">
        <div>
          <p className="crc-label">Audience Location</p>
          <p className="crc-sub">Where is the hype loudest?</p>
        </div>
        <div className="crc-total">
          <span className="crc-total-num">{totalEngagements}</span>
          <span className="crc-total-label">total</span>
        </div>
      </div>

      {/* City cards */}
      <div className="crc-list">
        {cities.map((entry, i) => (
          <CityCard
            key={entry.city}
            entry={entry}
            rank={i}
            animate={animate}
          />
        ))}
      </div>

      <style jsx>{`
        .crc-wrap {
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .crc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .crc-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0 0 4px;
        }

        .crc-sub {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-silver);
          margin: 0;
        }

        .crc-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .crc-total-num {
          font-family: var(--font-clash);
          font-size: 20px;
          font-weight: 700;
          color: var(--color-kritiq-white);
          line-height: 1;
        }

        .crc-total-label {
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .crc-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}