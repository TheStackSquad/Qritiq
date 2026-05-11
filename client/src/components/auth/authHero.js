"use client";

// src/components/auth/authHero.js
// CSS-only slideshow hero panel for login + signup pages.
// Uses public/KritiQ/AccountHero/ — no Cloudinary, no JS libs.
// 7 images × 5s = 35s full cycle. Ken Burns zoom + crossfade.

const SLIDES = [
  { src: "/KritiQ/AccountHero/hero1.jpg" },
  { src: "/KritiQ/AccountHero/hero2.jpg" },
  { src: "/KritiQ/AccountHero/hero3.jpg" },
  { src: "/KritiQ/AccountHero/hero4.jpg" },
  { src: "/KritiQ/AccountHero/hero5.webp" },
  { src: "/KritiQ/AccountHero/hero6.jpg" },
  { src: "/KritiQ/AccountHero/hero7.jpg" },
];

const TOTAL = SLIDES.length; // 7
const DURATION = TOTAL * 5; // 35s total cycle
const PER_SLIDE = DURATION / TOTAL; // 5s each

export default function AuthHero() {
  return (
    <div className="hero-root" aria-hidden="true">
      {/* Slideshow */}
      <div className="slides">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="slide"
            style={{ animationDelay: `${i * PER_SLIDE}s` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt="" className="slide-img" />
          </div>
        ))}
      </div>

      {/* Overlay stack — cinematic depth */}
      <div className="ov ov-vignette" />
      <div className="ov ov-red" />
      <div className="ov ov-bottom" />
      <div className="ov ov-right" />

      {/* KritiQ branding — bottom left */}
      <div className="brand">
        <span className="brand-logo">KritiQ</span>
        <p className="brand-tag">Nigeria&apos;s pulse on film &amp; music</p>
        <div className="film-strip">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="film-hole" />
          ))}
        </div>
      </div>

      {/* Progress dots — right edge */}
      <div className="dots">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="dot"
            style={{ animationDelay: `${i * PER_SLIDE}s` }}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #050505;
        }

        /* ── Slides ─────────────────────────────────────── */
        .slides {
          position: absolute;
          inset: 0;
        }

        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: kenBurns ${DURATION}s ease-in-out infinite;
          will-change: opacity, transform;
        }

        .slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          filter: brightness(0.72) saturate(1.15);
        }

        /*
          Each slide visible for 5s of 35s cycle = 14.28%
          Fade in  0→2.28% (0.8s)
          Hold     2.28→14.28%
          Fade out 14.28→16.57% (0.8s)
          Dark     16.57→100%
        */
        @keyframes kenBurns {
          0% {
            opacity: 0;
            transform: scale(1) translate(0%, 0%);
          }
          2.28% {
            opacity: 1;
            transform: scale(1) translate(0%, 0%);
          }
          14.28% {
            opacity: 1;
            transform: scale(1.09) translate(-1.5%, -1%);
          }
          16.57% {
            opacity: 0;
            transform: scale(1.11) translate(-2%, -1.5%);
          }
          99.9% {
            opacity: 0;
            transform: scale(1) translate(0%, 0%);
          }
          100% {
            opacity: 0;
            transform: scale(1) translate(0%, 0%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slide {
            animation: none;
          }
          .slide:first-child {
            opacity: 1;
          }
        }

        /* ── Overlays ───────────────────────────────────── */
        .ov {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .ov-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 25%,
            rgba(0, 0, 0, 0.6) 100%
          );
          z-index: 2;
        }

        .ov-red {
          background: linear-gradient(
            135deg,
            rgba(192, 0, 26, 0.24) 0%,
            transparent 55%
          );
          z-index: 3;
        }

        /* Heavy bottom fade — brand area stays readable */
        .ov-bottom {
          background: linear-gradient(
            to top,
            rgba(5, 5, 5, 0.97) 0%,
            rgba(5, 5, 5, 0.55) 25%,
            transparent 55%
          );
          z-index: 4;
        }

        /* Right edge fade — blends into form panel */
        .ov-right {
          background: linear-gradient(
            to right,
            transparent 60%,
            rgba(13, 13, 13, 0.85) 100%
          );
          z-index: 4;
        }

        /* ── Branding ────────────────────────────────────── */
        .brand {
          position: absolute;
          bottom: 44px;
          left: 40px;
          z-index: 10;
        }

        .brand-logo {
          display: block;
          font-family: "Clash Grotesk", sans-serif;
          font-weight: 700;
          font-size: 2.75rem;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #e8001f, #ff4433);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 8px;
        }

        .brand-tag {
          font-family: "Lexend", sans-serif;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.45);
          margin: 0 0 18px;
          letter-spacing: 0.015em;
        }

        /* Decorative film strip */
        .film-strip {
          display: flex;
          gap: 7px;
          align-items: center;
        }

        .film-hole {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        /* ── Progress dots ───────────────────────────────── */
        .dots {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dot {
          width: 3px;
          height: 22px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.18);
          animation: dotPulse ${DURATION}s linear infinite;
        }

        @keyframes dotPulse {
          0% {
            background: rgba(255, 255, 255, 0.18);
          }
          2.28% {
            background: rgba(192, 0, 26, 0.95);
          }
          14.28% {
            background: rgba(192, 0, 26, 0.95);
          }
          16.57% {
            background: rgba(255, 255, 255, 0.18);
          }
          100% {
            background: rgba(255, 255, 255, 0.18);
          }
        }
      `}</style>
    </div>
  );
}
