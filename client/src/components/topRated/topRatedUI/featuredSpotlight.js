// client/src/components/topRated/topRatedUI/featuredSpotlight.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Star, ChevronRight } from "lucide-react";

/**
 * FeaturedSpotlight
 * Editorial hero card for the weekly featured person.
 * Full-width banner with photo, bio, and scores.
 * Purple accent for Spotlight identity.
 * CSS-only fade-in on mount — no JS animation libraries.
 *
 * @param {{ person: import("@/types/spotlight").Person }} props
 */
export default function FeaturedSpotlight({ person }) {
  if (!person) return null;

  return (
    <Link
      href={`/top-rated/spotlight/${person.slug}`}
      style={{ textDecoration: "none", display: "block", padding: "0 16px" }}
    >
      <article
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--color-kritiq-dark-1, #111)",
          border: "1px solid rgba(139,92,246,0.25)",
          animation: "fsMount 350ms ease forwards",
        }}
      >
        {/* Cover photo */}
        {person.photo_url && (
          <div
            style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
          >
            <Image
              src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_700,q_auto,f_auto/${person.photo_url}`}
              alt={person.name}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              style={{ objectFit: "cover" }}
              priority
            />
            {/* Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Featured badge */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(139,92,246,0.9)",
                borderRadius: 99,
                padding: "4px 10px",
                fontFamily: "var(--font-lexend, sans-serif)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              ✨ Spotlight
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          <p
            style={{
              fontFamily: "var(--font-lexend, sans-serif)",
              fontSize: 11,
              fontWeight: 600,
              color: "#a78bfa",
              margin: "0 0 4px",
              textTransform: "capitalize",
            }}
          >
            {person.primary_role_label ?? person.primary_role}
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lexend, sans-serif)",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-kritiq-white, #fff)",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            {person.name}
          </h2>

          {person.bio && (
            <p
              style={{
                fontFamily: "var(--font-lexend, sans-serif)",
                fontSize: 13,
                color: "var(--color-kritiq-ash, #aaa)",
                margin: "0 0 10px",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {person.bio}
            </p>
          )}

          {/* Scores + CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              {person.avg_hype_score > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={12} color="#f59e0b" aria-hidden="true" />
                  <span
                    style={{
                      fontFamily: "var(--font-lexend, sans-serif)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#f59e0b",
                    }}
                  >
                    {Math.round(person.avg_hype_score)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-lexend, sans-serif)",
                      fontSize: 11,
                      color: "var(--color-kritiq-ash, #777)",
                    }}
                  >
                    avg hype
                  </span>
                </div>
              )}
              {person.avg_rating > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} color="#f59e0b" aria-hidden="true" />
                  <span
                    style={{
                      fontFamily: "var(--font-lexend, sans-serif)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-kritiq-white, #fff)",
                    }}
                  >
                    {person.avg_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontFamily: "var(--font-lexend, sans-serif)",
                fontSize: 12,
                fontWeight: 600,
                color: "#a78bfa",
              }}
            >
              View profile <ChevronRight size={13} aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>

      <style>{`
        @keyframes fsMount {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Link>
  );
}
