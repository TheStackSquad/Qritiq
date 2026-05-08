// client/src/app/trending/page.js
"use client";

import { useState } from "react";
import VerdictSplit from "../../components/trending/trendingUI/verdictSplit";
import HypeRadar from "../../components/trending/trendingUI/hyperRadar";
import { useHypeRadar, useVerdictSplit } from "../../utils/hooks/useTrending";

const TABS = [
  { id: "radar", label: "Hype Radar", emoji: "📡" },
  { id: "verdict", label: "Verdict Split", emoji: "⚖️" },
];

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState("radar");

  const {
    data: radarMovies,
    isLoading: radarLoading,
    isError: radarError,
  } = useHypeRadar();

  const {
    data: verdictMovies,
    isLoading: verdictLoading,
    isError: verdictError,
  } = useVerdictSplit();

  return (
    <div className="trending-page">
      <div className="page-header">
        <span className="page-eyebrow">Nollywood</span>
        <h1 className="page-title">Trending</h1>
        <p className="page-sub">
          What the streets are watching, rating, and predicting right now.
        </p>
      </div>

      {/* ── Sticky tab nav — pill style ──────────────────── */}
      <div className="tab-nav-wrap">
        <nav className="tab-nav" role="tablist" aria-label="Trending sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content ──────────────────────────────────────── */}

      <div className="tab-content">
        {activeTab === "radar" && (
          <HypeRadar
            movies={radarMovies}
            isLoading={radarLoading}
            isError={radarError}
          />
        )}
        {activeTab === "verdict" && (
          <VerdictSplit
            movies={verdictMovies}
            isLoading={verdictLoading}
            isError={verdictError}
          />
        )}
      </div>

      <style jsx>{`
        .trending-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 16px 60px;
          min-height: 100vh;
        }

        /* ── Header ─────────────────────────────────────── */
        .page-header {
          margin-bottom: 24px;
        }
        .page-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-kritiq-ember);
          background: rgba(255, 68, 51, 0.1);
          border: 1px solid rgba(255, 68, 51, 0.2);
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 10px;
        }
        .page-title {
          font-family: var(--font-clash);
          font-size: clamp(28px, 8vw, 42px);
          font-weight: 700;
          color: var(--color-kritiq-white);
          margin: 0 0 8px;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .page-sub {
          font-family: var(--font-gilroy);
          font-size: 14px;
          color: var(--color-kritiq-ash);
          margin: 0;
          line-height: 1.6;
        }

        /* ── Tab nav ─────────────────────────────────────── */
        .tab-nav-wrap {
          position: sticky;
          top: 64px; /* below the fixed header */
          z-index: 20;
          background: var(--color-kritiq-black);
          padding: 10px 0;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
          border-bottom: 1px solid var(--color-kritiq-dark-3);
          margin-bottom: 24px;
        }
        .tab-nav {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .tab-nav::-webkit-scrollbar {
          display: none;
        }
        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid var(--color-kritiq-dark-3);
          background: transparent;
          color: var(--color-kritiq-silver);
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .tab-btn:hover {
          border-color: rgba(192, 0, 26, 0.3);
          color: var(--color-kritiq-white);
        }
        .tab-btn.active {
          background: var(--color-kritiq-red);
          border-color: var(--color-kritiq-red);
          color: var(--color-kritiq-white);
        }
        .tab-emoji {
          font-size: 14px;
          line-height: 1;
        }

        /* ── Content ─────────────────────────────────────── */
        .tab-content {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Desktop: wider layout ───────────────────────── */
        @media (min-width: 768px) {
          .trending-page {
            max-width: 860px;
            padding: 90px 24px 80px;
          }
          .tab-nav-wrap {
            margin: 0 -24px;
            padding-left: 24px;
            padding-right: 24px;
          }
        }
      `}</style>
    </div>
  );
}
