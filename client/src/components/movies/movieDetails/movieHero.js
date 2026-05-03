// src/components/movies/movieDetails/MovieHero.js
"use client";

import Image from "next/image";
import { Calendar, Eye, ThumbsUp } from "lucide-react";
import { getPosterUrl } from "@/services/cloudinary/upload/urlBuilders";

function StatPill({ icon: Icon, value, label }) {
  if (!value && value !== 0) return null;
  return (
    <span className="mh-stat">
      <Icon size={11} />
      {value.toLocaleString()} {label}
    </span>
  );
}

export default function MovieHero({ movie }) {
  const { src, blurDataURL } = movie.poster_url
    ? getPosterUrl(movie.poster_url, { width: 300, height: 450 })
    : { src: null, blurDataURL: null };

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const genre = movie.genre?.split("/")?.[0] ?? null;

  return (
    <div className="mh-root">
      {/* ── Blurred background poster ──────────────────────── */}
      {src && (
        <div className="mh-bg">
          <Image
            src={
              getPosterUrl(movie.poster_url, {
                width: 400,
                height: 300,
                decorative: true,
              }).src
            }
            alt=""
            fill
            className="mh-bg-img"
            priority
          />
          <div className="mh-bg-overlay" />
        </div>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      <div className="mh-content">
        {/* Poster */}
        <div className="mh-poster">
          {src ? (
            <Image
              src={src}
              alt={movie.title}
              fill
              sizes="110px"
              className="mh-poster-img"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL ?? undefined}
              priority
            />
          ) : (
            <span className="mh-poster-fallback">
              {movie.title?.[0] ?? "?"}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mh-meta">
          {movie.status === "pre_release" && (
            <span className="mh-status-pill">Pre-Release</span>
          )}
          <h1 className="mh-title">{movie.title}</h1>
          <div className="mh-pills">
            {genre && <span className="mh-pill">{genre}</span>}
            {year && (
              <span className="mh-pill">
                <Calendar size={10} />
                {year}
              </span>
            )}
          </div>
          <div className="mh-stats">
            <StatPill icon={ThumbsUp} value={movie.total_likes} label="likes" />
            <StatPill icon={Eye} value={movie.total_views} label="views" />
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .mh-root {
          position: relative;
          padding: 80px 16px 24px;
          overflow: hidden;
        }

        /* ── Blurred background ───────────────────────────────── */

        .mh-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        :global(.mh-bg-img) {
          object-fit: cover;
          filter: blur(24px) brightness(0.3) saturate(1.4);
          transform: scale(1.1);
        }

        .mh-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            var(--color-kritiq-black) 100%
          );
        }

        /* ── Content ──────────────────────────────────────────── */

        .mh-content {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 16px;
          align-items: flex-end;
        }

        /* ── Poster ───────────────────────────────────────────── */

        .mh-poster {
          position: relative;
          width: 110px;
          height: 165px;
          border-radius: var(--radius-card);
          overflow: hidden;
          background: var(--color-kritiq-dark-2);
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        }

        :global(.mh-poster-img) {
          object-fit: cover;
        }

        .mh-poster-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-clash);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-kritiq-ash);
          text-transform: uppercase;
        }

        /* ── Meta ─────────────────────────────────────────────── */

        .mh-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mh-status-pill {
          display: inline-block;
          font-family: var(--font-lexend);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: var(--radius-badge);
          background: rgba(192, 0, 26, 0.85);
          color: #fff;
          width: fit-content;
        }

        .mh-title {
          font-family: var(--font-clash);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-kritiq-white);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        /* ── Pills ────────────────────────────────────────────── */

        .mh-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .mh-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          background: rgba(255, 255, 255, 0.07);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* ── Stats ────────────────────────────────────────────── */

        .mh-stats {
          display: flex;
          gap: 10px;
        }

        :global(.mh-stat) {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
        }
      `}</style>
    </div>
  );
}
