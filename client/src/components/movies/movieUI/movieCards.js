// client/src/components/movies/movieCards.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Star } from "lucide-react";
import { getPosterUrl } from "../../../services/cloudinary/upload/urlBuilders";

// ─── Helpers ──────────────────────────────────────────────────────

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

function StatusPill({ status }) {
  if (!status || status === "released") return null;
  return (
    <span className="mc-status">
      {status === "pre_release" ? "Pre-Release" : "Archived"}
    </span>
  );
}

function ScoreBadge({ movie, hypeScore, ratingScore }) {
  if (movie.status === "pre_release" && hypeScore > 0) {
    return (
      <div className="mc-badge" style={{ color: hypeColor(hypeScore) }}>
        <Flame size={11} strokeWidth={2.5} />
        <span>{Math.round(hypeScore)}</span>
      </div>
    );
  }
  if (movie.status === "released" && ratingScore > 0) {
    return (
      <div className="mc-badge" style={{ color: ratingColor(ratingScore) }}>
        <Star size={11} strokeWidth={2.5} fill="currentColor" />
        <span>{ratingScore.toFixed(1)}</span>
      </div>
    );
  }
  if (hypeScore > 0) {
    return (
      <div className="mc-badge" style={{ color: hypeColor(hypeScore) }}>
        <Flame size={11} strokeWidth={2.5} />
        <span>{Math.round(hypeScore)}</span>
      </div>
    );
  }
  return null;
}

// ─── Card ─────────────────────────────────────────────────────────

export default function MovieCard({ movie, priority = false }) {
  if (!movie) return null;

  const hypeScore = parseFloat(movie.hype_score ?? 0) || 0;
  const ratingScore = parseFloat(movie.rating_score ?? 0) || 0;

  // getPosterUrl now returns { src, blurDataURL }
const { src: posterSrc, blurDataURL } = movie.poster_url
  ? getPosterUrl(movie.poster_url, { width: 300, height: 450 })
  : { 
      src: "/KritiQ/Placeholders/poster-placeholder.webp", // Default placeholder string
      blurDataURL: null 
    };

  const genre = movie.genre?.split("/")?.[0] ?? null;

  return (
    <Link href={`/movies/${movie.slug}`} className="mc" prefetch={false}>
      {/* ── Poster ──────────────────────────────────────────── */}
      <div className="mc-poster">
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, 20vw"
            className="mc-img"
            // priority and loading are mutually exclusive —
            // priority=true means eager fetch, no lazy attribute needed
            priority={priority}
            loading={priority ? undefined : "lazy"}
            // LQIP blur-up — blurDataURL is the 20×30 Cloudinary placeholder.
            // Next.js crossfades from blur → sharp when src finishes loading.
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL ?? undefined}
          />
        ) : (
          <div className="mc-no-poster">
            <span>{movie.title?.[0] ?? "?"}</span>
          </div>
        )}

        <div className="mc-overlay" />
        <StatusPill status={movie.status} />
        <ScoreBadge
          movie={movie}
          hypeScore={hypeScore}
          ratingScore={ratingScore}
        />
      </div>

      {/* ── Meta ────────────────────────────────────────────── */}
      <div className="mc-meta">
        <p className="mc-title line-clamp-2">{movie.title}</p>
        {genre && <p className="mc-genre">{genre}</p>}
      </div>

      <style jsx>{`
        .mc {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-decoration: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        .mc-poster {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: var(--radius-card);
          overflow: hidden;
          background: var(--color-kritiq-dark-2);
          border: 1px solid var(--color-kritiq-dark-3);
          transition:
            border-color 200ms ease,
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .mc:hover .mc-poster,
        .mc:focus-visible .mc-poster {
          border-color: rgba(192, 0, 26, 0.35);
          transform: translateY(-3px);
          box-shadow: var(--shadow-card-hover);
        }

        .mc:active .mc-poster {
          transform: scale(0.97);
        }

        .mc-img {
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .mc:hover .mc-img {
          transform: scale(1.04);
        }

        .mc-no-poster {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-kritiq-dark-3);
        }

        .mc-no-poster span {
          font-family: var(--font-clash);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-kritiq-ash);
          text-transform: uppercase;
        }

        .mc-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.72) 0%,
            transparent 45%
          );
          pointer-events: none;
        }

        .mc-status {
          position: absolute;
          top: 8px;
          left: 8px;
          font-family: var(--font-lexend);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 7px;
          border-radius: var(--radius-badge);
          background: rgba(192, 0, 26, 0.85);
          color: #fff;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .mc-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 3px 6px;
          border-radius: 6px;
        }

        .mc-meta {
          padding: 0 2px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mc-title {
          font-family: var(--font-lexend);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-white);
          margin: 0;
          line-height: 1.35;
        }

        .mc-genre {
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
      `}</style>
    </Link>
  );
}
