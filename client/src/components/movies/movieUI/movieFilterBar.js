// client/components/movies/movieFilterBar.js
// Horizontal scrollable filter tabs — Pre-Release / Released / All.
// Touch-friendly, scrollbar hidden on mobile.

"use client";

const FILTERS = [
  { label: "All",         value: "all"         },
  { label: "🔥 Pre-Release", value: "pre_release" },
  { label: "Released",    value: "released"    },
];

export default function MovieFilterBar({ active, onChange }) {
  return (
    <div className="filter-bar scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`filter-tab ${active === f.value ? "filter-tab--active" : ""}`}
        >
          {f.label}
        </button>
      ))}

      <style jsx>{`
        .filter-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .filter-tab {
          flex-shrink: 0;
          padding: 7px 16px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: transparent;
          color: var(--color-kritiq-ash);
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }

        .filter-tab:hover {
          border-color: rgba(192, 0, 26, 0.3);
          color: var(--color-kritiq-silver);
        }

        .filter-tab--active {
          background: rgba(192, 0, 26, 0.12);
          border-color: rgba(192, 0, 26, 0.4);
          color: var(--color-kritiq-ember);
        }
      `}</style>
    </div>
  );
}