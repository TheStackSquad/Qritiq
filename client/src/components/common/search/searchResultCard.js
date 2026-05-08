// client/src/components/common/search/SearchResultCard.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Star, Clock, Film } from "lucide-react";
import { getPosterUrl } from "../../../services/cloudinary/upload/urlBuilders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hypeColor(score) {
  if (score >= 80) return "var(--color-hype)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-kritiq-ash)";
}

function ratingColor(score) {
  if (score >= 4.0) return "#22C55E";
  if (score >= 3.0) return "#F59E0B";
  return "var(--color-kritiq-ash)";
}

function formatStatus(status) {
  return status === "pre_release" ? "Pre-Release" : "Released";
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ result }) {
  if (result.status === "pre_release" && result.hype_score > 0) {
    return (
      <span
        className="src-score"
        style={{ color: hypeColor(result.hype_score) }}
      >
        <Flame size={11} strokeWidth={2.5} />
        {Math.round(result.hype_score)} Hype
      </span>
    );
  }
  if (result.status === "released" && result.rating_score > 0) {
    return (
      <span
        className="src-score"
        style={{ color: ratingColor(result.rating_score) }}
      >
        <Star size={11} strokeWidth={2.5} fill="currentColor" />
        {result.rating_score.toFixed(1)}
      </span>
    );
  }
  return null;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function SearchResultCard({ result }) {
  const { src, blurDataURL } = result.poster_url
    ? getPosterUrl(result.poster_url, { width: 80, height: 120 })
    : { src: null, blurDataURL: null };

  const genre = result.genre?.split("/")?.[0] ?? null;
  const year = result.release_date
    ? new Date(result.release_date).getFullYear()
    : null;

  return (
    <Link href={`/movies/${result.slug}`} className="src-root" prefetch={false}>
      {/* ── Poster ────────────────────────────────────────────── */}
      <div className="src-poster">
        {src ? (
          <Image
            src={src}
            alt={result.title}
            fill
            sizes="80px"
            className="src-img"
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL ?? undefined}
          />
        ) : (
          <span className="src-fallback">{result.title?.[0] ?? "?"}</span>
        )}
      </div>

      {/* ── Meta ──────────────────────────────────────────────── */}
      <div className="src-meta">
        <p className="src-title">{result.title}</p>

        <div className="src-pills">
          {year && (
            <span className="src-pill">
              <Clock size={10} />
              {year}
            </span>
          )}
          {genre && (
            <span className="src-pill">
              <Film size={10} />
              {genre}
            </span>
          )}
          <span className="src-pill src-pill--status">
            {formatStatus(result.status)}
          </span>
        </div>

        <ScoreBadge result={result} />
      </div>

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        :global(.src-root) {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: var(--radius-card);
          border: 1px solid var(--color-kritiq-dark-3);
          background: var(--color-kritiq-dark-1);
          text-decoration: none;
          transition:
            border-color 150ms ease,
            background 150ms ease;
        }

        :global(.src-root:hover) {
          border-color: rgba(192, 0, 26, 0.3);
          background: var(--color-kritiq-dark-2);
        }

        /* ── Poster ───────────────────────────────────────────── */

        :global(.src-poster) {
          position: relative;
          width: 52px;
          height: 78px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--color-kritiq-dark-3);
          flex-shrink: 0;
        }

        :global(.src-img) {
          object-fit: cover;
        }

        :global(.src-fallback) {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-clash);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-kritiq-ash);
          text-transform: uppercase;
        }

        /* ── Meta ─────────────────────────────────────────────── */

        :global(.src-meta) {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        :global(.src-title) {
          font-family: var(--font-lexend);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-kritiq-white);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Pills ────────────────────────────────────────────── */

        :global(.src-pills) {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        :global(.src-pill) {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 7px;
          border-radius: 4px;
        }

        :global(.src-pill--status) {
          color: var(--color-kritiq-silver);
        }

        /* ── Score ────────────────────────────────────────────── */

        :global(.src-score) {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>
    </Link>
  );
}
