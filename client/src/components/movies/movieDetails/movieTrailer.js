// src/components/movies/movieDetails/movieTrailer.js
"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Image from "next/image";
import { useEngage } from "@/utils/hooks/useEngagement";

export default function MovieTrailer({ movie }) {
  const [playing, setPlaying] = useState(false);
  const engage = useEngage();

  if (!movie?.trailer_url) return null;

  const videoId = movie.trailer_url;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  function handlePlay() {
    setPlaying(true);
    // Fire watch engagement — fire and forget, doesn't block play
    engage.mutate({
      contentId: movie.id,
      contentType: "movie",
      engagementType: "watch",
      slug: movie.slug,
    });
  }

  return (
    <div className="mt-root">
      <p className="mt-label">Trailer</p>

      <div className="mt-player">
        {playing ? (
          <iframe
            src={embedUrl}
            title={`${movie.title} trailer`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="mt-iframe"
            loading="lazy"
          />
        ) : (
          <button
            className="mt-thumb"
            onClick={handlePlay}
            aria-label="Play trailer"
          >
            <Image
              src={thumbUrl}
              alt={`${movie.title} trailer thumbnail`}
              fill
              sizes="100vw"
              className="mt-thumb-img"
            />
            <div className="mt-thumb-overlay" />
            <div className="mt-play-btn">
              <Play size={28} fill="white" strokeWidth={0} />
            </div>
          </button>
        )}
      </div>

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .mt-root {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mt-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }

        /* ── Player ───────────────────────────────────────────── */

        .mt-player {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: var(--radius-card);
          overflow: hidden;
          background: var(--color-kritiq-dark-2);
        }

        /* ── Thumbnail ────────────────────────────────────────── */

        .mt-thumb {
          position: absolute;
          inset: 0;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          width: 100%;
          height: 100%;
          -webkit-tap-highlight-color: transparent;
        }

        :global(.mt-thumb-img) {
          object-fit: cover;
        }

        .mt-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
        }

        .mt-play-btn {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mt-play-btn > :global(svg) {
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
          transition: transform 150ms ease;
        }

        .mt-thumb:hover .mt-play-btn > :global(svg) {
          transform: scale(1.1);
        }

        /* ── Iframe ───────────────────────────────────────────── */

        :global(.mt-iframe) {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
}
