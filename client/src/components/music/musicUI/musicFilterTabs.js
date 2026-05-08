// client/src/components/musicUI/musicFilterTabs.js

"use client";

//import { Flame, Clock, CheckCircle } from "lucide-react";

const TABS = [
  { value: "all", label: "All", icon: null },
  { value: "pre_release", label: "🔥 Pre-Release", icon: null },
  { value: "released", label: "Out Now", icon: null },
];

const GENRES = [
  { value: "Afrobeats", emoji: "🎸" },
  { value: "Afropop", emoji: "🎤" },
  { value: "Alte", emoji: "✨" },
  { value: "Amapiano", emoji: "🎹" },
  { value: "Highlife", emoji: "🎺" },
  { value: "Gospel", emoji: "🙌" },
  { value: "Hip-Hop", emoji: "🎧" },
  { value: "R&B", emoji: "💫" },
];

export default function MusicFilterTabs({
  activeTab,
  activeGenre,
  onTabChange,
  onGenreChange,
}) {
  return (
    <div className="mft-root">
      {/* Status tabs */}
      <div
        className="mft-tabs"
        role="tablist"
        aria-label="Filter by release status"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            className={`mft-tab ${activeTab === tab.value ? "mft-tab--active" : ""}`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Genre pills */}
      <div className="mft-genres" aria-label="Filter by genre">
        {GENRES.map((g) => (
          <button
            key={g.value}
            className={`mft-genre ${activeGenre === g.value ? "mft-genre--active" : ""}`}
            onClick={() =>
              onGenreChange(activeGenre === g.value ? null : g.value)
            }
          >
            {g.emoji} {g.value}
          </button>
        ))}
      </div>

      <style jsx>{`
        .mft-root {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 16px;
        }

        /* Status tabs */
        .mft-tabs {
          display: flex;
          gap: 8px;
        }

        .mft-tab {
          padding: 9px 18px;
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
          white-space: nowrap;
        }
        .mft-tab:hover {
          background: var(--color-kritiq-dark-2, #1a1a1a);
          color: var(--color-kritiq-silver, #ccc);
        }
        .mft-tab--active {
          background: var(--color-kritiq-red, #c0001a);
          border-color: var(--color-kritiq-red, #c0001a);
          color: #fff;
        }

        /* Genre pill scroll */
        .mft-genres {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 2px;
        }
        .mft-genres::-webkit-scrollbar {
          display: none;
        }

        .mft-genre {
          flex-shrink: 0;
          padding: 6px 14px;
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
        }
        .mft-genre:hover {
          background: var(--color-kritiq-dark-2, #1a1a1a);
          color: var(--color-kritiq-silver, #ccc);
        }
        .mft-genre--active {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
}
