// client/src/components/common/navbar/mobile/mobileSearch.js

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Search, X, Flame, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "../../../../utils/hooks/useKritiQ";
import { getPosterUrl } from "../../../../services/cloudinary/upload/urlBuilders";
import useUIStore from "../../../../sessions/uiStore";
import clsx from "clsx";

// Helper: Format release status for display
function formatStatus(status) {
  return status === "pre_release" ? "Pre-Release" : "Released";
}

// Sub-component: Displays Hype (Flame) or Rating (Star) scores
function ScorePill({ result }) {
  if (result.status === "pre_release" && result.hype_score > 0) {
    return (
      <span className="ms-score ms-score--hype">
        <Flame size={9} strokeWidth={2.5} />
        {Math.round(result.hype_score)}
      </span>
    );
  }
  if (result.status === "released" && result.rating_score > 0) {
    return (
      <span className="ms-score ms-score--rating">
        <Star size={9} strokeWidth={2.5} fill="currentColor" />
        {result.rating_score.toFixed(1)}
      </span>
    );
  }
  return null;
}

// Sub-component: Individual search result row with Cloudinary optimization
function MobileResultRow({ result, onClick }) {
  const { src, blurDataURL } = result.poster_url
    ? getPosterUrl(result.poster_url, { width: 60, height: 80 })
    : { src: null, blurDataURL: null };

  const year = result.release_date
    ? new Date(result.release_date).getFullYear()
    : null;
  const genre = result.genre?.split("/")?.[0] ?? null;

  return (
    <Link
      href={`/movies/${result.slug}`}
      onClick={onClick}
      prefetch={false}
      className="ms-row"
    >
      <div className="ms-thumb">
        {src ? (
          <Image
            src={src}
            alt={result.title || "Poster"}
            fill
            sizes="40px"
            className="ms-thumb-img"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL ?? undefined}
          />
        ) : (
          <span className="ms-thumb-fallback">{result.title?.[0] ?? "?"}</span>
        )}
      </div>
      <div className="ms-meta">
        <p className="ms-title">{result.title}</p>
        <div className="ms-sub">
          {year && (
            <span className="ms-pill">
              <Clock size={9} />
              {year}
            </span>
          )}
          {genre && <span className="ms-pill">{genre}</span>}
          <ScorePill result={result} />
        </div>
        <p className="ms-status">{formatStatus(result.status)}</p>
      </div>
    </Link>
  );
}

// Sub-component: Skeleton loader for fetching states
function MobileSkeleton() {
  return (
    <div className="ms-skeleton">
      <div className="ms-skeleton-thumb" />
      <div className="ms-skeleton-lines">
        <div className="ms-skeleton-line ms-skeleton-line--title" />
        <div className="ms-skeleton-line ms-skeleton-line--sub" />
      </div>
    </div>
  );
}

export default function MobileSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const { searchOpen, closeSearch, closeAll } = useUIStore();
  const { data: results = [], isFetching } = useSearch(searchOpen ? query : "");

  // Handler: Batches state clearing and closing for high-performance renders
  const handleClose = useCallback(() => {
    setQuery("");
    closeSearch();
  }, [closeSearch]);

  // Handler: Resets search state before navigating to a new route
  const handleNavigate = () => {
    setQuery("");
    closeAll();
  };

  // Effect: Delayed auto-focus to ensure smooth overlay transition
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Effect: Global Escape key listener for intuitive closing
  // Escape key - Now including handleClose in the dependencies
  useEffect(() => {
    if (!searchOpen) return;

    const handler = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen, handleClose]); // <--- Add handleClose here

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      handleNavigate();
    }
  }

  const hasQuery = query.length >= 2;
  const hasResults = results.length > 0;

  return (
    <div
      aria-hidden={!searchOpen}
      className={clsx(
        "ms-root md:hidden",
        searchOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      {/* Search Header Section */}
      <div className="ms-bar">
        <Search size={18} className="ms-bar-icon" />
        <form onSubmit={handleSubmit} className="ms-form">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="ms-input"
            aria-label="Search inputs"
            tabIndex={searchOpen ? 0 : -1}
          />
        </form>
        {query ? (
          <button
            className="ms-clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
          >
            <X size={16} />
          </button>
        ) : (
          <button
            className="ms-close"
            onClick={handleClose}
            aria-label="Close search overlay"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Content Body */}
      <div className="ms-body">
        {hasQuery && isFetching && (
          <div className="ms-list">
            {[...Array(4)].map((_, i) => (
              <MobileSkeleton key={i} />
            ))}
          </div>
        )}

        {hasQuery && !isFetching && hasResults && (
          <>
            <div className="ms-list">
              {results.map((r) => (
                <MobileResultRow
                  key={r.id}
                  result={r}
                  onClick={handleNavigate}
                />
              ))}
            </div>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="ms-see-all"
              onClick={handleNavigate}
            >
              See all results for <strong>&ldquo;{query}&rdquo;</strong>
            </Link>
          </>
        )}

        {hasQuery && !isFetching && !hasResults && (
          <div className="ms-state">
            <p>
              No results for <strong>&ldquo;{query}&rdquo;</strong>
            </p>
            <span>Try a different title or genre</span>
          </div>
        )}

        {!hasQuery && (
          <div className="ms-trending">
            <p className="ms-trending-label">Trending Now</p>
            {["Gangs of Lagos 2", "Breath of Life", "King Of Boys"].map((t) => (
              <button
                key={t}
                className="ms-trending-item"
                onClick={() => setQuery(t)}
              >
                <Search size={13} className="ms-trending-icon" />
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}