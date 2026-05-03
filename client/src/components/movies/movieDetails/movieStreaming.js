// src/components/movies/movieDetails/MovieStreaming.js
"use client";

import { ExternalLink } from "lucide-react";

// ─── Nigerian-first streaming priority ────────────────────────────────────────
// ShowMax and Prime Video have the strongest Nollywood catalogues.
// Netflix NG is growing. YouTube is free and carries many Nollywood titles.
// iROKOtv is Nigeria's dedicated platform — always listed first.

const PLATFORMS = [
  {
    id:    "irokotv",
    name:  "iROKOtv",
    note:  "Nigeria's #1",
    color: "#E50914",
    url:   (title) => `https://www.irokotv.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    id:    "showmax",
    name:  "Showmax",
    note:  "Best for Nollywood",
    color: "#1CE4B2",
    url:   (title) => `https://www.showmax.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    id:    "prime",
    name:  "Prime Video",
    note:  "Growing catalogue",
    color: "#00A8E1",
    url:   (title) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`,
  },
  {
    id:    "netflix",
    name:  "Netflix",
    note:  "Select titles",
    color: "#E50914",
    url:   (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    id:    "youtube",
    name:  "YouTube",
    note:  "Free / rent",
    color: "#FF0000",
    url:   (title) => `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " full movie")}`,
  },
];

export default function MovieStreaming({ title }) {
  if (!title) return null;

  return (
    <div className="mst-root">
      <p className="mst-label">Where to Watch</p>
      <div className="mst-list">
        {PLATFORMS.map((p) => (
          <a // <--- You were missing the "a" tag name here!
            key={p.id}
            href={p.url(title)}
            target="_blank"
            rel="noopener noreferrer"
            className="mst-link"
          >
            <div className="mst-dot" style={{ background: p.color }} />
            <div className="mst-text">
              <span className="mst-name">{p.name}</span>
              <span className="mst-note">{p.note}</span>
            </div>
            <ExternalLink size={13} className="mst-icon" />
          </a>
        ))}
      </div>

      <style jsx>{`
        /* ── Root ─────────────────────────────────────────────── */

        .mst-root {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mst-label {
          font-family: var(--font-lexend);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }

        /* ── List ─────────────────────────────────────────────── */

        .mst-list {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-card);
          border: 1px solid var(--color-kritiq-dark-3);
          overflow: hidden;
        }

        /* ── Link row ─────────────────────────────────────────── */

        .mst-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 14px;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mst-link:last-child {
          border-bottom: none;
        }
        .mst-link:active {
          background: var(--color-kritiq-dark-2);
        }

        /* ── Dot ──────────────────────────────────────────────── */

        .mst-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Text ─────────────────────────────────────────────── */

        .mst-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .mst-name {
          font-family: var(--font-lexend);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-kritiq-white);
        }

        .mst-note {
          font-family: var(--font-lexend);
          font-size: 11px;
          color: var(--color-kritiq-ash);
        }

        /* ── Icon ─────────────────────────────────────────────── */

        :global(.mst-icon) {
          color: var(--color-kritiq-ash);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}