// client/src/components/common/search/searchInput.js
"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SearchInput({ value, onChange, onClear, autoFocus = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="si-root">
      <Search size={16} className="si-icon" />

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search movies, genres, directors..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="si-input"
        aria-label="Search"
      />

      {value && (
        <button className="si-clear" onClick={onClear} aria-label="Clear">
          <X size={14} />
        </button>
      )}

      <style jsx>{`

        /* ── Root ─────────────────────────────────────────────── */

        .si-root {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          max-width: 560px;
          height: 48px;
          padding: 0 16px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: var(--color-kritiq-dark-2);
          transition: border-color 150ms ease;
        }

        .si-root:focus-within {
          border-color: rgba(192, 0, 26, 0.45);
        }

        /* ── Icon ─────────────────────────────────────────────── */

        .si-icon {
          color: var(--color-kritiq-ash);
          flex-shrink: 0;
        }

        /* ── Input ────────────────────────────────────────────── */

        .si-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-lexend);
          font-size: 15px;
          color: var(--color-kritiq-white);
          min-width: 0;
        }

        .si-input::placeholder {
          color: var(--color-kritiq-ash);
        }

        .si-input::-webkit-search-cancel-button {
          display: none;
        }

        /* ── Clear ────────────────────────────────────────────── */

        .si-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--color-kritiq-ash);
          flex-shrink: 0;
          transition: color 120ms ease;
        }

        .si-clear:hover {
          color: var(--color-kritiq-silver);
        }

      `}</style>
    </div>
  );
}