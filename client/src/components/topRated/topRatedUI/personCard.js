// client/src/components/topRated/topRatedUI/personCard.js
"use client";

/**
 * PersonCard
 * Used in the Spotlight grid.
 * Photo, name, role, avg hype score.
 * Tap → /top-rated/spotlight/[slug]
 *
 * Low bandwidth: image lazy-loaded, no JS animation on card level.
 * Scale on tap via CSS active state — no JS needed.
 */

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

const ROLE_EMOJI = {
  actor: "🎭",
  director: "🎬",
  musician: "🎵",
  producer: "🎛️",
  scriptwriter: "✍️",
  songwriter: "🎼",
  cinematographer: "📽️",
  sound_engineer: "🎚️",
  editor: "✂️",
  costume_designer: "👗",
  set_designer: "🏗️",
  other: "⭐",
};

export default function PersonCard({ person }) {
  const {
    slug,
    name,
    primary_role,
    primary_role_label,
    photo_url,
    avg_hype_score,
    total_credits,
  } = person;

  const emoji = ROLE_EMOJI[primary_role] ?? "⭐";
  const href = `/top-rated/spotlight/${slug}`;

  return (
    <Link href={href} className="pc-root" aria-label={`View ${name}'s profile`}>
      {/* Photo */}
      <div className="pc-photo">
        {photo_url ? (
          <Image
            src={photo_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 44vw, 200px"
            className="pc-img"
            loading="lazy"
          />
        ) : (
          <div className="pc-fallback" aria-hidden="true">
            <span className="pc-fallback-emoji">{emoji}</span>
          </div>
        )}
        <div className="pc-gradient" aria-hidden="true" />

        {/* Hype badge overlay */}
        {avg_hype_score > 0 && (
          <div
            className="pc-hype-badge"
            aria-label={`Hype score ${Math.round(avg_hype_score)}`}
          >
            <Flame size={9} strokeWidth={2.5} aria-hidden="true" />
            {Math.round(avg_hype_score)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pc-info">
        <p className="pc-name">{name}</p>
        <p className="pc-role">
          <span aria-hidden="true">{emoji}</span> {primary_role_label}
        </p>
        {total_credits > 0 && (
          <p className="pc-credits">
            {total_credits} credit{total_credits !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <style jsx>{`
        .pc-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-decoration: none;
          /* Scale on tap — GPU composited, zero JS */
          transition: transform 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .pc-root:active {
          transform: scale(0.97);
        }

        .pc-photo {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .pc-img {
          object-fit: cover;
          transition: transform 300ms ease;
        }
        .pc-root:hover .pc-img {
          transform: scale(1.04);
        }

        .pc-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #111 100%);
        }
        .pc-fallback-emoji {
          font-size: 28px;
        }

        .pc-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 55%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
        }

        .pc-hype-badge {
          position: absolute;
          bottom: 7px;
          right: 7px;
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(0, 0, 0, 0.7);
          color: #f59e0b;
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 99px;
        }

        .pc-info {
          padding: 0 2px;
        }
        .pc-name {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-kritiq-white, #fff);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-root:hover .pc-name {
          color: #8b5cf6;
        }

        .pc-role {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #888);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pc-credits {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          color: var(--color-kritiq-ash, #666);
          margin: 0;
        }
      `}</style>
    </Link>
  );
}
