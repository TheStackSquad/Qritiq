// client/src/components/musicDetails/streamingLinks.js

"use client";

import { ExternalLink } from "lucide-react";

/**
 * StreamingLinks
 * Renders platform links passed from the track's metadata.
 * track.streaming_links shape (optional fields from your backend):
 * {
 *   spotify?: string,
 *   apple_music?: string,
 *   audiomack?: string,
 *   boomplay?: string,
 *   youtube_music?: string,
 *   soundcloud?: string,
 * }
 */

const PLATFORMS = [
  {
    key: "boomplay",
    label: "Boomplay",
    color: "#ff6600",
    bg: "rgba(255,102,0,0.08)",
    border: "rgba(255,102,0,0.2)",
    // SVG path for Boomplay B icon — simplified
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#ff6600" />
        <text
          x="7"
          y="17"
          fontSize="13"
          fontWeight="700"
          fill="#fff"
          fontFamily="sans-serif"
        >
          B
        </text>
      </svg>
    ),
  },
  {
    key: "audiomack",
    label: "Audiomack",
    color: "#ffa200",
    bg: "rgba(255,162,0,0.08)",
    border: "rgba(255,162,0,0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#ffa200" />
        <path
          d="M5 17V9l7-3 7 3v8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14" r="3" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
  },
  {
    key: "spotify",
    label: "Spotify",
    color: "#1db954",
    bg: "rgba(29,185,84,0.08)",
    border: "rgba(29,185,84,0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#1db954" />
        <path
          d="M17 10.5c-3-1.8-8-2-11-1.1"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.5 13c-2.5-1.5-6.5-1.8-9.5-.8"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M15.5 15.5c-2-1.1-5-1.5-7.5-.5"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "apple_music",
    label: "Apple Music",
    color: "#fc3c44",
    bg: "rgba(252,60,68,0.08)",
    border: "rgba(252,60,68,0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#fc3c44" />
        <path
          d="M9 17V9l8-2v2.5L11 11v6"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="17" r="2" fill="#fff" />
        <circle cx="17" cy="15" r="2" fill="#fff" />
      </svg>
    ),
  },
  {
    key: "youtube_music",
    label: "YouTube Music",
    color: "#ff0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#ff0000" />
        <circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="1.8" />
        <polygon points="10,9.5 16,12 10,14.5" fill="#fff" />
      </svg>
    ),
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    color: "#ff5500",
    bg: "rgba(255,85,0,0.08)",
    border: "rgba(255,85,0,0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#ff5500" />
        <path
          d="M3 14c0-1.5 1-2.5 2-2.5.1 0 .2 0 .3.01A4.5 4.5 0 0112 8a4.5 4.5 0 014.4 3.5H17a3 3 0 010 6H5a2 2 0 01-2-2z"
          fill="#fff"
        />
      </svg>
    ),
  },
];

export default function StreamingLinks({ links = {} }) {
  const available = PLATFORMS.filter((p) => links[p.key]);
  if (!available.length) return null;

  return (
    <div className="sl-root">
      <p className="sl-label">Stream It</p>
      <div className="sl-list">
        {available.map((p) => (
          <a
            key={p.key}
            href={links[p.key]}
            target="_blank"
            rel="noopener noreferrer"
            className="sl-link"
            style={{
              "--p-color": p.color,
              "--p-bg": p.bg,
              "--p-border": p.border,
            }}
          >
            <span className="sl-icon">{p.icon}</span>
            <span className="sl-name">{p.label}</span>
            <ExternalLink size={12} className="sl-ext" />
          </a>
        ))}
      </div>

      <style jsx>{`
        .sl-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sl-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
        .sl-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sl-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          background: var(--p-bg);
          border: 1px solid var(--p-border);
          text-decoration: none;
          transition: opacity 150ms ease;
        }
        .sl-link:hover {
          opacity: 0.8;
        }
        .sl-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .sl-name {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--p-color);
          flex: 1;
        }
        .sl-ext {
          color: var(--p-color);
          opacity: 0.6;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
