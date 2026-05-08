// client/components/auth/HeroPoster.js
// Cinematic left panel — login + signup pages.
// Cloudinary posters, infinite CSS scroll, no JS animation library.

"use client";

import Image from "next/image";
import { getPosterUrl } from "../../services/cloudinary/upload/urlBuilders";

// ─── Poster data ──────────────────────────────────────────────────────────────

const COL_A = [
  { id: "kritiq/uploads/images/posters/king-of-boys", title: "King Of Boys" },
  { id: "kritiq/uploads/images/posters/house-of-ga-a", title: "House Of Ga'a" },
  { id: "kritiq/uploads/images/posters/amina", title: "Amina" },
  { id: "kritiq/uploads/images/posters/dead-tide", title: "Dead Tide" },
  {
    id: "kritiq/uploads/images/posters/the-arbitration",
    title: "The Arbitration",
  },
];

const COL_B = [
  {
    id: "kritiq/uploads/images/posters/funmilayo-ransome-kuti",
    title: "Funmilayo",
  },
  { id: "kritiq/uploads/images/posters/stalker", title: "Stalker" },
  {
    id: "kritiq/uploads/images/posters/king-of-thieves",
    title: "King Of Thieves",
  },
  {
    id: "kritiq/uploads/images/posters/ti-oluwa-ni-ile",
    title: "Ti Oluwa Ni Ile",
  },
  { id: "kritiq/uploads/images/posters/blackout", title: "Blackout" },
];

// ─── Poster column ────────────────────────────────────────────────────────────

function PosterColumn({ items, offset = false, animClass = "scroll-up" }) {
  const doubled = [...items, ...items];

  return (
    <div
      className={`poster-col ${animClass} ${offset ? "poster-col--offset" : ""}`}
    >
      {doubled.map((item, i) => {
        const { src, blurDataURL } = getPosterUrl(item.id, {
          width: 200,
          height: 300,
          decorative: true,
        });

        return (
          <div key={`${item.id}-${i}`} className="poster-item">
            <Image
              src={src}
              alt={item.title}
              width={200}
              height={300}
              className="poster-img"
              loading="lazy"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL ?? undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Hero panel ───────────────────────────────────────────────────────────────

export default function HeroPoster() {
  return (
    <div className="hero-panel" aria-hidden="true">
      <div className="hero-overlay" />

      <div className="poster-grid">
        <PosterColumn items={COL_A} animClass="scroll-up" />
        <PosterColumn items={COL_B} animClass="scroll-down" offset />
      </div>

      <div className="hero-brand">
        <span className="hero-logo">KritiQ</span>
        <p className="hero-tagline">Nigeria&apos;s pulse on film &amp; music</p>
      </div>

      <style jsx>{`
        /* ── Panel ────────────────────────────────────────────── */

        .hero-panel {
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
          width: 100%;
          height: 100%;
        }

        /* ── Overlay ──────────────────────────────────────────── */

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            linear-gradient(to right, transparent 60%, #0d0d0d 100%),
            linear-gradient(
              to bottom,
              #0d0d0d 0%,
              transparent 15%,
              transparent 85%,
              #0d0d0d 100%
            ),
            linear-gradient(135deg, rgba(192, 0, 26, 0.18) 0%, transparent 60%);
        }

        /* ── Branding ─────────────────────────────────────────── */

        .hero-brand {
          position: absolute;
          bottom: 48px;
          left: 40px;
          z-index: 3;
        }

        .hero-logo {
          display: block;
          font-family: "Clash Grotesk", sans-serif;
          font-weight: 700;
          font-size: 2.5rem;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #e8001f, #ff4433);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-tagline {
          font-family: "Lexend", sans-serif;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 4px;
        }

        /* ── Poster grid ──────────────────────────────────────── */

        .poster-grid {
          display: flex;
          gap: 10px;
          padding: 0 6px;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        .poster-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .poster-col--offset {
          margin-top: -80px;
        }

        .poster-item {
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .poster-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          filter: brightness(0.85) saturate(1.1);
        }

        /* ── Scroll animations ────────────────────────────────── */

        @keyframes scrollUp {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        @keyframes scrollDown {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }

        .scroll-up {
          animation: scrollUp 40s linear infinite;
        }
        .scroll-down {
          animation: scrollDown 40s linear infinite;
        }

        /* ── Accessibility ────────────────────────────────────── */

        @media (prefers-reduced-motion: reduce) {
          .scroll-up,
          .scroll-down {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
