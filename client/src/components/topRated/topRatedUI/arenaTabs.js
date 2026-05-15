// client/src/components/topRated/topRatedUI/arenaTabs.js
"use client";

/**
 * ArenaTabs
 * Sticky horizontal tab strip for the /top-rated page.
 * Scroll-driven: parent passes activeSection, tabs jump to section anchors.
 *
 * Low bandwidth: pure CSS, zero JS animation libraries.
 * Accessibility: role="tablist", aria-selected, keyboard navigable.
 */

const TABS = [
  {
    id: "arena",
    label: "⚔️ Arena",
    accent: "var(--color-kritiq-red, #c0001a)",
  },
  { id: "leaderboard", label: "🔥 Street Pull", accent: "#f59e0b" },
  { id: "spotlight", label: "✨ Spotlight", accent: "#8b5cf6" },
];

export default function ArenaTabs({ activeSection, onTabClick }) {
  return (
    <nav className="at-root" aria-label="Top Rated page sections">
      <div className="at-strip" role="tablist" aria-label="Jump to section">
        {TABS.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`section-${tab.id}`}
              className={`at-tab ${isActive ? "at-tab--active" : ""}`}
              style={isActive ? { "--tab-accent": tab.accent } : {}}
              onClick={() => onTabClick(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .at-root {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(10, 10, 10, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 0.5px solid var(--color-kritiq-dark-3, #1e1e1e);
          padding: 0 16px;
        }

        .at-strip {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 10px 0;
        }
        .at-strip::-webkit-scrollbar {
          display: none;
        }

        .at-tab {
          flex-shrink: 0;
          padding: 7px 16px;
          border-radius: 99px;
          border: 0.5px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          /* GPU-composited transition — no layout thrashing */
          transition:
            color 150ms ease,
            border-color 150ms ease,
            background 150ms ease;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }

        .at-tab:focus-visible {
          outline: 2px solid var(--tab-accent, var(--color-kritiq-red));
          outline-offset: 2px;
        }

        .at-tab--active {
          color: var(--tab-accent, var(--color-kritiq-red));
          border-color: var(--tab-accent, var(--color-kritiq-red));
          background: color-mix(
            in srgb,
            var(--tab-accent, var(--color-kritiq-red)) 10%,
            transparent
          );
        }

        @media (min-width: 640px) {
          .at-root {
            padding: 0 24px;
          }
          .at-tab {
            font-size: 14px;
            padding: 8px 20px;
          }
        }
      `}</style>
    </nav>
  );
}
