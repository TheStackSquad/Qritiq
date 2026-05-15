// client/src/app/top-rated/spotlight/[slug]/page.js
"use client";

/**
 * /top-rated/spotlight/[slug] — Person detail page
 *
 * Sections:
 *  ① Hero — photo, name, role, scores, social links, bio
 *  ② Works panel — all credited movies and music
 *
 * Performance / Lighthouse:
 *  - Hero photo: priority load (above fold), explicit sizes
 *  - Works thumbnails: lazy loaded, 44px sizes
 *  - Social link icons: inline SVG — zero network request
 *  - No animation library — CSS transitions + mount flag
 *  - PersonDetailSkeleton matches rendered dimensions exactly (zero CLS)
 *
 * Accessibility:
 *  - Social links have aria-label
 *  - Works panel is a <section> with aria-label
 *  - Back navigation uses <Link> not onClick for crawlability
 */

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Flame, Star, ExternalLink } from "lucide-react";
import { usePerson } from "../../../../utils/hooks/useSpotlight";
import WorksPanel from "../../../../components/topRated/topRatedUI/worksPanel";
import { PersonDetailSkeleton } from "../../../../components/topRated/topRatedUI/spotlightSkeletons";

// ─── Role label map ───────────────────────────────────────────────────────────

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

// ─── Social links panel ───────────────────────────────────────────────────────

function SocialLinks({ links = {} }) {
  const platforms = [
    {
      key: "instagram",
      label: "Instagram",
      color: "#e1306c",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "Twitter / X",
      color: "#1da1f2",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4l16 16M4 20L20 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: "website",
      label: "Website",
      color: "#f59e0b",
      icon: <ExternalLink size={16} aria-hidden="true" />,
    },
    {
      key: "management_email",
      label: "Management",
      color: "#22c55e",
      isEmail: true,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const available = platforms.filter((p) => links[p.key]);
  if (!available.length) return null;

  return (
    <div className="sl-root">
      {available.map((p) => (
        <a
          key={p.key}
          href={p.isEmail ? `mailto:${links[p.key]}` : links[p.key]}
          target={p.isEmail ? undefined : "_blank"}
          rel={p.isEmail ? undefined : "noopener noreferrer"}
          className="sl-btn"
          style={{ "--sl-color": p.color }}
          aria-label={p.label}
        >
          {p.icon}
        </a>
      ))}

      <style jsx>{`
        .sl-root {
          display: flex;
          gap: 10px;
        }
        .sl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 0.5px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          text-decoration: none;
          transition:
            color 150ms ease,
            border-color 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .sl-btn:hover {
          color: var(--sl-color);
          border-color: var(--sl-color);
        }
        .sl-btn:focus-visible {
          outline: 2px solid var(--sl-color);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ icon, value, label, color }) {
  if (!value || value === 0) return null;
  return (
    <div className="sb-root" aria-label={`${label}: ${value}`}>
      <span className="sb-icon" style={{ color }} aria-hidden="true">
        {icon}
      </span>
      <span className="sb-val" style={{ color }}>
        {value}
      </span>
      <span className="sb-label">{label}</span>

      <style jsx>{`
        .sb-root {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--color-kritiq-dark-1, #111);
          border: 0.5px solid var(--color-kritiq-dark-3, #2a2a2a);
          border-radius: 99px;
          padding: 5px 12px;
        }
        .sb-val {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          font-weight: 700;
        }
        .sb-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #888);
        }
      `}</style>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpotlightPersonPage({ params }) {
  const { slug } = use(params);
  const { data: person, isLoading, isError } = usePerson(slug);

  if (isLoading) return <PersonDetailSkeleton />;

  if (isError || !person) {
    return (
      <main className="sp-error">
        <p>Person not found.</p>
        <Link href="/top-rated" className="sp-back">
          ← Back to Top Rated
        </Link>
        <style jsx>{`
          .sp-error {
            padding: 48px 16px;
            text-align: center;
            font-family: var(--font-lexend, sans-serif);
            color: var(--color-kritiq-ash, #888);
            min-height: 100vh;
            background: var(--color-kritiq-black, #0a0a0a);
          }
          .sp-back {
            display: inline-block;
            margin-top: 12px;
            font-size: 13px;
            color: #8b5cf6;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  const emoji = ROLE_EMOJI[person.primary_role] ?? "⭐";

  return (
    <main className="sp-root">
      {/* Back nav */}
      <nav className="sp-nav" aria-label="Back navigation">
        <Link href="/top-rated" className="sp-back-btn">
          <ChevronLeft size={16} strokeWidth={2.5} aria-hidden="true" />
          Top Rated
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="sp-hero">
        {/* Photo */}
        <div className="sp-photo-wrap">
          {person.photo_url ? (
            <Image
              src={person.photo_url}
              alt={person.name}
              fill
              sizes="(max-width: 640px) 70vw, 280px"
              className="sp-photo-img"
              priority
            />
          ) : (
            <div className="sp-photo-fallback" aria-hidden="true">
              <span className="sp-fallback-emoji">{emoji}</span>
            </div>
          )}
          {/* Purple glow border on featured */}
          {person.is_featured && (
            <div className="sp-featured-ring" aria-label="Featured artist" />
          )}
        </div>

        {/* Meta */}
        <div className="sp-meta">
          {/* Role badge */}
          <p className="sp-role">
            <span aria-hidden="true">{emoji}</span>{" "}
            {person.primary_role_label ?? person.primary_role}
          </p>

          {/* Name */}
          <h1 className="sp-name">{person.name}</h1>

          {/* Nationality + credits */}
          <p className="sp-credits">
            {person.nationality}
            {person.total_credits > 0
              ? ` · ${person.total_credits} credit${person.total_credits !== 1 ? "s" : ""}`
              : ""}
          </p>

          {/* Scores */}
          <div className="sp-scores">
            <ScoreBadge
              icon={<Flame size={13} />}
              value={
                person.avg_hype_score > 0
                  ? Math.round(person.avg_hype_score)
                  : null
              }
              label="avg hype"
              color="#f59e0b"
            />
            <ScoreBadge
              icon={<Star size={13} />}
              value={
                person.avg_rating > 0 ? person.avg_rating.toFixed(1) : null
              }
              label="avg rating"
              color="#f59e0b"
            />
          </div>

          {/* Social links */}
          <SocialLinks links={person.social_links ?? {}} />
        </div>
      </header>

      {/* Bio */}
      {person.bio && (
        <section className="sp-bio-section" aria-label="Biography">
          <p className="sp-bio">{person.bio}</p>
        </section>
      )}

      {/* Divider */}
      <div className="sp-divider" aria-hidden="true" />

      {/* ── Works panel ──────────────────────────────────────────────────── */}
      <WorksPanel credits={person.credits ?? []} />

      {/* Bottom padding */}
      <div className="sp-bottom-pad" aria-hidden="true" />

      <style jsx>{`
        .sp-root {
          min-height: 100vh;
          background: var(--color-kritiq-black, #0a0a0a);
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 0;
        }

        /* Back nav */
        .sp-nav {
          padding: 12px 16px 0;
        }
        .sp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-ash, #888);
          text-decoration: none;
          transition: color 150ms ease;
          -webkit-tap-highlight-color: transparent;
        }
        .sp-back-btn:hover {
          color: var(--color-kritiq-white, #fff);
        }
        .sp-back-btn:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Hero — stacked on mobile, side-by-side on tablet+ */
        .sp-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px 16px 24px;
          text-align: center;
        }

        /* Photo */
        .sp-photo-wrap {
          position: relative;
          width: min(200px, 65vw);
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
          flex-shrink: 0;
        }
        .sp-photo-img {
          object-fit: cover;
        }
        .sp-photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }
        .sp-fallback-emoji {
          font-size: 48px;
        }
        .sp-featured-ring {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          border: 2px solid rgba(139, 92, 246, 0.6);
          pointer-events: none;
        }

        /* Meta */
        .sp-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .sp-role {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #a78bfa;
          margin: 0;
        }
        .sp-name {
          font-family: var(--font-lexend, sans-serif);
          font-size: 26px;
          font-weight: 800;
          color: var(--color-kritiq-white, #fff);
          margin: 0;
          line-height: 1.15;
        }
        .sp-credits {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          color: var(--color-kritiq-ash, #777);
          margin: 0;
        }
        .sp-scores {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Bio */
        .sp-bio-section {
          padding: 0 16px;
        }
        .sp-bio {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          color: var(--color-kritiq-ash, #aaa);
          line-height: 1.7;
          margin: 0;
        }

        .sp-divider {
          height: 0.5px;
          background: var(--color-kritiq-dark-3, #1a1a1a);
          margin: 20px 16px;
        }

        .sp-bottom-pad {
          height: 80px;
        }

        /* Tablet+ — side-by-side hero */
        @media (min-width: 640px) {
          .sp-hero {
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
          }
          .sp-meta {
            align-items: flex-start;
          }
          .sp-scores {
            justify-content: flex-start;
          }
          .sp-photo-wrap {
            width: 200px;
          }
        }
        @media (min-width: 1024px) {
          .sp-root {
            max-width: 900px;
            margin: 0 auto;
          }
        }
      `}</style>
    </main>
  );
}
