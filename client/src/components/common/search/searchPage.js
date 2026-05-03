// client/src/components/common/search/searchPage.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/utils/hooks/useKritiQ";
import SearchInput from "@/components/common/search/searchInput";
import SearchResultCard from "@/components/common/search/searchResultCard";
import SearchResultsSkeleton from "@/components/common/search/searchResultsSkeleton";
import Footer from "@/components/home/footer/index";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "🔥 Pre-Release", value: "pre_release" },
  { label: "Released", value: "released" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filter, setFilter] = useState("all");

  const { data: results = [], isFetching, isError } = useSearch(query);

  // Keep URL in sync as user types
  useEffect(() => {
    const trimmed = query.trim();
    const current = searchParams.get("q") ?? "";
    if (trimmed === current) return;
    const next = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : "/search";
    router.replace(next, { scroll: false });
  }, [query, router, searchParams]);

  const filtered = useMemo(() => {
    if (filter === "all") return results;
    return results.filter((r) => r.status === filter);
  }, [results, filter]);

  const hasQuery = query.length >= 2;
  const hasResults = filtered.length > 0;

  return (
    <>
      <main
        className="search-page"
        style={{ background: "var(--color-kritiq-black)" }}
      >
        <div className="search-container">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="search-header">
            <h1 className="search-heading">Search</h1>
            <SearchInput
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
              autoFocus
            />
          </div>

          {/* ── Filter bar ──────────────────────────────────── */}
          {hasQuery && !isFetching && hasResults && (
            <div className="search-filters">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`sf-tab ${filter === f.value ? "sf-tab--active" : ""}`}
                >
                  {f.label}
                  <span className="sf-count">
                    {f.value === "all"
                      ? results.length
                      : results.filter((r) => r.status === f.value).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── Results ─────────────────────────────────────── */}
          <div className="search-results">
            {isFetching && <SearchResultsSkeleton count={5} />}

            {!isFetching &&
              hasQuery &&
              hasResults &&
              filtered.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}

            {!isFetching && hasQuery && !hasResults && !isError && (
              <div className="search-empty">
                <p>
                  No results for <strong>&ldquo;{query}&rdquo;</strong>
                </p>
                <span>Try a different title, genre, or director</span>
              </div>
            )}

            {!isFetching && !hasQuery && (
              <div className="search-idle">
                <p>Start typing to search Nollywood</p>
              </div>
            )}

            {isError && (
              <div className="search-empty">
                <p>Search failed</p>
                <span>Check your connection and try again</span>
              </div>
            )}
          </div>

          {/* ── Result count ────────────────────────────────── */}
          {!isFetching && hasQuery && hasResults && (
            <p className="search-count">
              {filtered.length} {filtered.length === 1 ? "title" : "titles"}
            </p>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        /* ── Page ─────────────────────────────────────────────── */

        .search-page {
          min-height: 100vh;
          padding-top: 72px;
        }

        .search-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 16px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Header ───────────────────────────────────────────── */

        .search-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-heading {
          font-family: var(--font-clash);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-kritiq-white);
          margin: 0;
          letter-spacing: -0.02em;
        }

        /* ── Filter bar ───────────────────────────────────────── */

        .search-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sf-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-kritiq-dark-3);
          background: transparent;
          color: var(--color-kritiq-ash);
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
        }

        .sf-tab:hover {
          border-color: rgba(192, 0, 26, 0.3);
          color: var(--color-kritiq-silver);
        }

        .sf-tab--active {
          background: rgba(192, 0, 26, 0.12);
          border-color: rgba(192, 0, 26, 0.4);
          color: var(--color-kritiq-ember);
        }

        .sf-count {
          font-size: 11px;
          opacity: 0.6;
        }

        /* ── Results list ─────────────────────────────────────── */

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── States ───────────────────────────────────────────── */

        .search-empty,
        .search-idle {
          padding: 48px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .search-empty p,
        .search-idle p {
          font-family: var(--font-lexend);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-kritiq-silver);
          margin: 0;
        }

        .search-empty strong {
          color: var(--color-kritiq-white);
        }

        .search-empty span,
        .search-idle span {
          font-family: var(--font-lexend);
          font-size: 13px;
          color: var(--color-kritiq-ash);
        }

        /* ── Count ────────────────────────────────────────────── */

        .search-count {
          font-family: var(--font-lexend);
          font-size: 12px;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
      `}</style>
    </>
  );
}
