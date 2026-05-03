// client/src/components/common/navbar/searchBar.js
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Flame, Star, Clock } from "lucide-react";
import { useSearch } from "@/utils/hooks/useKritiQ";
import { getPosterUrl } from "@/services/cloudinary/upload/urlBuilders";
import Link from "next/link";
import Image from "next/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStatus(status) {
  return status === "pre_release" ? "Pre-Release" : "Released";
}

function ScorePill({ result }) {
  if (result.status === "pre_release" && result.hype_score > 0) {
    return (
      <span className="sb-score sb-score--hype">
        <Flame size={9} strokeWidth={2.5} />
        {Math.round(result.hype_score)}
      </span>
    );
  }
  if (result.status === "released" && result.rating_score > 0) {
    return (
      <span className="sb-score sb-score--rating">
        <Star size={9} strokeWidth={2.5} fill="currentColor" />
        {result.rating_score.toFixed(1)}
      </span>
    );
  }
  return null;
}

function GenrePill({ genre }) {
  if (!genre) return null;
  return <span className="sb-genre">{genre.split("/")?.[0]}</span>;
}

// ─── Search result row ────────────────────────────────────────────────────────

function SearchResultRow({ result, onClick }) {
  const { src, blurDataURL } = result.poster_url
    ? getPosterUrl(result.poster_url, { width: 48, height: 64 })
    : { src: null, blurDataURL: null };

  const year = result.release_date
    ? new Date(result.release_date).getFullYear()
    : null;

  return (
    <Link
      href={`/movies/${result.slug}`}
      className="sb-row"
      onClick={onClick}
      prefetch={false}
    >
      {/* Poster thumbnail */}
      <div className="sb-thumb">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="36px"
            className="sb-thumb-img"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL ?? undefined}
          />
        ) : (
          <span className="sb-thumb-fallback">{result.title?.[0] ?? "?"}</span>
        )}
      </div>

      {/* Metadata */}
      <div className="sb-meta">
        <p className="sb-title">{result.title}</p>
        <div className="sb-sub">
          {year && (
            <span className="sb-year">
              <Clock size={9} />
              {year}
            </span>
          )}
          <GenrePill genre={result.genre} />
          <ScorePill result={result} />
        </div>
        <p className="sb-status">{formatStatus(result.status)}</p>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="sb-skeleton">
      <div className="sb-skeleton-thumb" />
      <div className="sb-skeleton-lines">
        <div className="sb-skeleton-line sb-skeleton-line--title" />
        <div className="sb-skeleton-line sb-skeleton-line--sub" />
      </div>
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

export default function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // query is passed directly — debounce lives inside useSearch via useDebounce
  const { data: results = [], isFetching } = useSearch(isOpen ? query : "");

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target)) close();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      close();
    }
    if (e.key === "Escape") close();
  }

  const showDropdown = isOpen && query.length >= 2;
  const showSkeleton = showDropdown && isFetching;
  const showResults = showDropdown && !isFetching && results.length > 0;
  const showEmpty = showDropdown && !isFetching && results.length === 0;

  return (
    <div ref={containerRef} className="sb-root">
      {/* ── Input pill ────────────────────────────────────────── */}
      <div
        className={`sb-pill ${isOpen ? "sb-pill--open" : ""}`}
        onClick={!isOpen ? open : undefined}
      >
        <Search size={15} className="sb-icon" />

        {isOpen && (
          <>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search movies..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="sb-input"
              aria-label="Search movies"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              role="combobox"
            />
            {query && (
              <button
                className="sb-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </>
        )}

        {!isOpen && <span className="sb-hint">Search</span>}
      </div>

      {/* ── Dropdown ──────────────────────────────────────────── */}
      {showDropdown && (
        <div className="sb-dropdown" role="listbox" aria-label="Search results">
          {showSkeleton && (
            <div className="sb-list">
              {[...Array(3)].map((_, i) => (
                <SearchSkeleton key={i} />
              ))}
            </div>
          )}

          {showResults && (
            <>
              <div className="sb-list">
                {results.slice(0, 6).map((result) => (
                  <SearchResultRow
                    key={result.id}
                    result={result}
                    onClick={close}
                  />
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="sb-footer"
                onClick={close}
              >
                See all results for <strong>&ldquo;{query}&rdquo;</strong>
              </Link>
            </>
          )}

          {showEmpty && (
            <div className="sb-empty">
              <p>
                No results for <strong>&ldquo;{query}&rdquo;</strong>
              </p>
              <span>Try a different title or genre</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .sb-root {
          position: relative;
        }

        /* ── Input pill ───────────────────────────────────────── */

        .sb-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 12px;
          border-radius: var(--radius-pill);
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition:
            width 220ms ease,
            background 150ms ease,
            border-color 150ms ease;
          width: 92px;
          overflow: hidden;
        }

        .sb-pill--open {
          width: 240px;
          background: var(--color-kritiq-dark-2);
          border-color: rgba(192, 0, 26, 0.35);
          cursor: default;
        }

        .sb-pill:not(.sb-pill--open):hover {
          background: var(--color-kritiq-dark-2);
          border-color: var(--color-kritiq-dark-3);
        }

        .sb-icon {
          color: var(--color-kritiq-silver);
          flex-shrink: 0;
        }

        .sb-hint {
          font-family: var(--font-lexend);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          white-space: nowrap;
        }

        /* ── Input ────────────────────────────────────────────── */

        .sb-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-lexend);
          font-size: 13px;
          color: var(--color-kritiq-white);
          min-width: 0;
        }

        .sb-input::placeholder {
          color: var(--color-kritiq-ash);
        }
        .sb-input::-webkit-search-cancel-button {
          display: none;
        }

        .sb-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: var(--color-kritiq-ash);
          flex-shrink: 0;
          transition: color 120ms ease;
        }

        .sb-clear:hover {
          color: var(--color-kritiq-silver);
        }

        /* ── Dropdown ─────────────────────────────────────────── */

        .sb-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 340px;
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-card-hover);
          z-index: 50;
          overflow: hidden;
          animation: sb-drop 150ms ease;
        }

        @keyframes sb-drop {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Result list ──────────────────────────────────────── */

        .sb-list {
          display: flex;
          flex-direction: column;
        }

        /* ── Result row ───────────────────────────────────────── */

        :global(.sb-row) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          text-decoration: none;
          transition: background 120ms ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        :global(.sb-row:last-child) {
          border-bottom: none;
        }
        :global(.sb-row:hover) {
          background: var(--color-kritiq-dark-2);
        }

        /* ── Thumbnail ────────────────────────────────────────── */

        :global(.sb-thumb) {
          position: relative;
          width: 36px;
          height: 48px;
          border-radius: 4px;
          background: var(--color-kritiq-dark-3);
          flex-shrink: 0;
          overflow: hidden;
        }

        :global(.sb-thumb-img) {
          object-fit: cover;
        }

        :global(.sb-thumb-fallback) {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-clash);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-kritiq-ash);
          text-transform: uppercase;
        }

        /* ── Metadata ─────────────────────────────────────────── */

        :global(.sb-meta) {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        :global(.sb-title) {
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-white);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.sb-sub) {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        :global(.sb-year) {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
        }

        :global(.sb-genre) {
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          background: rgba(255, 255, 255, 0.06);
          padding: 1px 5px;
          border-radius: 3px;
        }

        :global(.sb-score) {
          display: flex;
          align-items: center;
          gap: 2px;
          font-family: var(--font-lexend);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
        }

        :global(.sb-score--hype) {
          color: var(--color-hype);
          background: rgba(255, 100, 0, 0.1);
        }

        :global(.sb-score--rating) {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        :global(.sb-status) {
          font-family: var(--font-lexend);
          font-size: 10px;
          color: var(--color-kritiq-ash);
          margin: 0;
          opacity: 0.7;
        }

        /* ── Footer ───────────────────────────────────────────── */

        :global(.sb-footer) {
          display: block;
          padding: 10px 14px;
          font-family: var(--font-lexend);
          font-size: 12px;
          color: var(--color-kritiq-ash);
          text-decoration: none;
          border-top: 1px solid var(--color-kritiq-dark-3);
          transition:
            background 120ms ease,
            color 120ms ease;
          text-align: center;
        }

        :global(.sb-footer:hover) {
          background: var(--color-kritiq-dark-2);
          color: var(--color-kritiq-silver);
        }

        :global(.sb-footer strong) {
          color: var(--color-kritiq-white);
        }

        /* ── Empty ────────────────────────────────────────────── */

        .sb-empty {
          padding: 20px 14px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sb-empty p {
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-silver);
          margin: 0;
        }

        .sb-empty strong {
          color: var(--color-kritiq-white);
        }

        .sb-empty span {
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
        }

        /* ── Skeleton ─────────────────────────────────────────── */

        .sb-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .sb-skeleton-thumb {
          width: 36px;
          height: 48px;
          border-radius: 4px;
          background: var(--color-kritiq-dark-3);
          flex-shrink: 0;
          animation: sb-shimmer 1.4s ease infinite;
        }

        .sb-skeleton-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sb-skeleton-line {
          border-radius: 4px;
          background: var(--color-kritiq-dark-3);
          animation: sb-shimmer 1.4s ease infinite;
        }

        .sb-skeleton-line--title {
          height: 12px;
          width: 70%;
        }
        .sb-skeleton-line--sub {
          height: 10px;
          width: 45%;
          animation-delay: 0.15s;
        }

        @keyframes sb-shimmer {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* ── Mobile ───────────────────────────────────────────── */

        @media (max-width: 480px) {
          .sb-pill--open {
            width: 200px;
          }
          .sb-dropdown {
            width: calc(100vw - 32px);
            left: auto;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}
