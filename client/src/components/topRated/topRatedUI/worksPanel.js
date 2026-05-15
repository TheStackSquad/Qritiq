// client/src/components/topRated/topRatedUI/worksPanel.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Star } from "lucide-react";

/**
 * WorksPanel
 * Grid of content items a person has been credited on.
 * Used on the spotlight/[slug] person page.
 * Images lazy loaded — low bandwidth safe.
 *
 * @param {{ credits: import("@/types/spotlight").PersonCredit[] }} props
 */
export default function WorksPanel({ credits = [] }) {
  if (!credits.length) {
    return (
      <p style={{
        fontFamily: "var(--font-lexend, sans-serif)",
        fontSize:   13,
        color:      "var(--color-kritiq-ash, #666)",
        padding:    "20px 0",
        margin:     0,
      }}>
        No credits yet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {credits.map((credit) => {
        const href = credit.content_type === "movie"
          ? `/movies/${credit.content_slug}`
          : `/music/${credit.content_slug}`;

        return (
          <Link
            key={credit.id}
            href={href}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article style={{
              display:      "flex",
              gap:          12,
              alignItems:   "center",
              background:   "var(--color-kritiq-dark-1, #111)",
              border:       "1px solid var(--color-kritiq-dark-3, #1e1e1e)",
              borderRadius: 10,
              padding:      "10px 12px",
              transition:   "border-color 150ms ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-kritiq-dark-3, #1e1e1e)"; }}
            >
              {/* Thumbnail */}
              {credit.content_image && (
                <div style={{
                  position:     "relative",
                  width:        44,
                  height:       44,
                  borderRadius: 8,
                  overflow:     "hidden",
                  flexShrink:   0,
                }}>
                  <Image
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_100,q_auto,f_auto/${credit.content_image}`}
                    alt={credit.content_title ?? ""}
                    fill
                    sizes="44px"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily:   "var(--font-lexend, sans-serif)",
                  fontSize:     13,
                  fontWeight:   500,
                  color:        "var(--color-kritiq-white, #fff)",
                  margin:       "0 0 2px",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {credit.content_title}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily:  "var(--font-lexend, sans-serif)",
                    fontSize:    10,
                    fontWeight:  600,
                    color:       "#a78bfa",
                    textTransform: "capitalize",
                  }}>
                    {credit.role_label ?? credit.role_on_project}
                  </span>

                  {credit.credit_detail && (
                    <span style={{
                      fontFamily: "var(--font-lexend, sans-serif)",
                      fontSize:   10,
                      color:      "var(--color-kritiq-ash, #666)",
                    }}>
                      · {credit.credit_detail}
                    </span>
                  )}
                </div>
              </div>

              {/* Scores */}
              <div style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "flex-end",
                gap:           3,
                flexShrink:    0,
              }}>
                {credit.content_hype > 0 && (
                  <span style={{
                    fontFamily:  "var(--font-lexend, sans-serif)",
                    fontSize:    11,
                    fontWeight:  600,
                    color:       "#f59e0b",
                    display:     "flex",
                    alignItems:  "center",
                    gap:         3,
                  }}>
                    <Flame size={10} aria-hidden="true" />
                    {Math.round(credit.content_hype)}
                  </span>
                )}
                {credit.content_rating > 0 && (
                  <span style={{
                    fontFamily:  "var(--font-lexend, sans-serif)",
                    fontSize:    11,
                    color:       "var(--color-kritiq-ash, #888)",
                    display:     "flex",
                    alignItems:  "center",
                    gap:         3,
                  }}>
                    <Star size={10} aria-hidden="true" />
                    {credit.content_rating.toFixed(1)}
                  </span>
                )}
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}