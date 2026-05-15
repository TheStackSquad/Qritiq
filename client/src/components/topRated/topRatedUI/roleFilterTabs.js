// client/src/components/topRated/topRatedUI/roleFilterTabs.js
"use client";

/**
 * RoleFilterTabs
 * Horizontal scrollable filter tabs for the Spotlight section.
 * Each tab filters persons by primary_role.
 */

const ROLES = [
  { value: "", label: "All" },
  { value: "actor", label: "Actors" },
  { value: "director", label: "Directors" },
  { value: "musician", label: "Musicians" },
  { value: "producer", label: "Producers" },
  { value: "scriptwriter", label: "Scriptwriters" },
  { value: "songwriter", label: "Songwriters" },
  { value: "cinematographer", label: "Cinematographers" },
  { value: "sound_engineer", label: "Sound Engineers" },
];

export default function RoleFilterTabs({ activeRole, onRoleChange }) {
  return (
    <div className="rft-root" role="tablist" aria-label="Filter by role">
      {ROLES.map((role) => {
        const isActive = activeRole === role.value;
        return (
          <button
            key={role.value}
            role="tab"
            aria-selected={isActive}
            className={`rft-tab ${isActive ? "rft-tab--active" : ""}`}
            onClick={() => onRoleChange(role.value)}
          >
            {role.label}
          </button>
        );
      })}

      <style jsx>{`
        .rft-root {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0 16px 2px;
        }
        .rft-root::-webkit-scrollbar {
          display: none;
        }

        .rft-tab {
          flex-shrink: 0;
          padding: 7px 14px;
          border-radius: 99px;
          border: 0.5px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition:
            color 150ms ease,
            border-color 150ms ease,
            background 150ms ease;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }
        .rft-tab:hover {
          color: var(--color-kritiq-silver, #ccc);
          border-color: #444;
        }
        .rft-tab:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }
        .rft-tab--active {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          color: #8b5cf6;
        }
      `}</style>
    </div>
  );
}
