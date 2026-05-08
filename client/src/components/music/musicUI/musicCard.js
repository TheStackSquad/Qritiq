// client/src/components/musicUI/musicCard.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Clock, Music2 } from "lucide-react";
import MusicSnippetPlayer from "./musicSnippetPlayer";

/**
 * MusicCard
 * Used in grid and row layouts on music/page.js
 * Optimised for low-bandwidth: cover image lazy loaded,
 * snippet audio only loads on tap.
 */

function HypeBadge({ score }) {
  const color = score >= 80 ? "#f59e0b" : score >= 60 ? "#c0001a" : "#888";
  return (
    <div className="mc-hype" style={{ color }}>
      <Flame size={11} strokeWidth={2.5} />
      <span>{Math.round(score)}</span>
      <style jsx>{`
        .mc-hype {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}

function StatusPill({ status, daysUntilRelease }) {
  const isPreRelease = status === "pre_release";
  return (
    <div
      className={`mc-status ${isPreRelease ? "mc-status--pre" : "mc-status--out"}`}
    >
      {isPreRelease ? (
        <>
          <Clock size={9} strokeWidth={2.5} />
          {daysUntilRelease != null && daysUntilRelease > 0
            ? `${daysUntilRelease}d`
            : "Pre-Release"}
        </>
      ) : (
        "Out Now"
      )}
      <style jsx>{`
        .mc-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 99px;
        }
        .mc-status--pre {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        .mc-status--out {
          background: rgba(192, 0, 26, 0.1);
          color: var(--color-kritiq-red, #c0001a);
          border: 1px solid rgba(192, 0, 26, 0.2);
        }
      `}</style>
    </div>
  );
}

export default function MusicCard({ track }) {
  const {
    id,
    slug,
    title,
    artist,
    cover_url,
    preview_url,
    genre,
    hype_score,
    total_hype_votes,
    status,
    days_until_release,
  } = track;

  return (
    <div className="mc-root">
      {/* Cover + player overlay */}
      <Link href={`/music/${slug}`} className="mc-cover-link" tabIndex={-1}>
        <div className="mc-cover">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={`${title} by ${artist}`}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="mc-img"
              loading="lazy"
            />
          ) : (
            <div className="mc-cover-fallback">
              <Music2 size={32} strokeWidth={1.5} />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="mc-gradient" />

          {/* Top badges */}
          <div className="mc-top-row">
            <StatusPill status={status} daysUntilRelease={days_until_release} />
            <HypeBadge score={hype_score ?? 0} />
          </div>

          {/* Compact play button on cover */}
          {preview_url && (
            <div
              className="mc-play-overlay"
              onClick={(e) => e.preventDefault()}
            >
              <MusicSnippetPlayer
                previewUrl={preview_url}
                trackId={id}
                compact
              />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="mc-info">
        <Link href={`/music/${slug}`} className="mc-title-link">
          <h3 className="mc-title">{title}</h3>
        </Link>
        <p className="mc-artist">{artist}</p>
        {genre && <p className="mc-genre">{genre}</p>}
        <p className="mc-votes">
          {(total_hype_votes ?? 0).toLocaleString()} votes
        </p>
      </div>

      <style jsx>{`
        .mc-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mc-cover-link {
          display: block;
          text-decoration: none;
        }

        .mc-cover {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }

        .mc-img {
          object-fit: cover;
          transition: transform 300ms ease;
        }
        .mc-cover:hover .mc-img {
          transform: scale(1.04);
        }

        .mc-cover-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-kritiq-ash, #666);
          background: linear-gradient(135deg, #1a1a1a 0%, #111 100%);
        }

        .mc-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.55) 100%
          );
          pointer-events: none;
        }

        .mc-top-row {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .mc-play-overlay {
          position: absolute;
          bottom: 10px;
          right: 10px;
        }

        .mc-info {
          padding: 0 2px;
        }

        .mc-title-link {
          text-decoration: none;
        }

        .mc-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-kritiq-white, #fff);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mc-title-link:hover .mc-title {
          color: var(--color-kritiq-red, #c0001a);
        }

        .mc-artist {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          color: var(--color-kritiq-ash, #888);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mc-genre {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          color: #f59e0b;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0 0 2px;
        }

        .mc-votes {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #666);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
