"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const SLIDES = [
  {
    img: "/KritiQ/AccountHero/hero1.jpg",
    gradient: "linear-gradient(145deg,#1a0005 0%,#5c000d 50%,#c0001a 100%)",
    label: "2.0x Influence Score",
    sub: "Your verdict carries double the weight. Pro status amplifies your impact on the Street Pull leaderboard.",
  },
  {
    img: "/KritiQ/AccountHero/hero2.jpg",
    gradient: "linear-gradient(145deg,#000a1a 0%,#002244 50%,#0055cc 100%)",
    label: "Geographic Heatmaps",
    sub: "Go beyond total views. Track exactly where your hype is peaking—from Lagos Mainland to the streets of Enugu.",
  },
  {
    img: "/KritiQ/AccountHero/hero3.jpg",
    gradient: "linear-gradient(145deg,#0d0005 0%,#3b0033 50%,#8b0057 100%)",
    label: "The Arena Verdict",
    sub: "Vote in weekly face-offs and use Pro Review Tags like 'Award-worthy' or 'Overrated' to lead the culture.",
  },
  {
    img: "/KritiQ/AccountHero/hero4.jpg",
    gradient: "linear-gradient(145deg,#001a0a 0%,#004020 50%,#006633 100%)",
    label: "Street Pull Analytics",
    sub: "Master the algorithm. Track how snippet plays, likes, and hype votes fuse into a single power score.",
  },
  {
    img: "/KritiQ/AccountHero/hero5.webp",
    gradient: "linear-gradient(145deg,#1a1a00 0%,#404000 50%,#808000 100%)",
    label: "30-Day Growth Snapshots",
    sub: "Analyze the trend. Use daily data snapshots to see exactly when a project goes from 'Meh' to 'Must-Watch'.",
  },
  {
    img: "/KritiQ/AccountHero/hero6.jpg",
    gradient: "linear-gradient(145deg,#1a001a 0%,#440044 50%,#990099 100%)",
    label: "Verified Spotlight",
    sub: "Claim your personhood. Verified creators and crew get featured profiles with aggregated hype across all works.",
  },
  {
    img: "/KritiQ/AccountHero/hero7.jpg",
    gradient: "linear-gradient(145deg,#001a1a 0%,#004444 50%,#008888 100%)",
    label: "Sentiment Deep-Dive",
    sub: "Move beyond the star rating. Filter reviews by specific cultural tags to hear what the streets are really saying.",
  },
  {
    img: "/KritiQ/AccountHero/hero8.jpg",
    gradient: "linear-gradient(145deg,#1a0d00 0%,#442200 50%,#884400 100%)",
    label: "Matchmaking Transparency",
    sub: "See the 'Why'. Access the Tier-based logic and match reasons behind every Arena battle.",
  },
];

const INTERVAL = 4500;

export default function AuthHero() {
  const [current, setCurrent] = useState(0);
  const [imgFailed, setImgFailed] = useState(() =>
    new Array(SLIDES.length).fill(false),
  );
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const pausedRef = useRef(false);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const startTimer = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(advance, INTERVAL);
  }, [advance]);

  useEffect(() => {
    // Explicitly check for window to satisfy linter/SSR
    if (typeof window === "undefined") return;

    const io = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pausedRef.current = false;
          startTimer();
        } else {
          pausedRef.current = true;
          window.clearInterval(timerRef.current);
        }
      },
      { threshold: 0.1 },
    );

    if (rootRef.current) io.observe(rootRef.current);
    startTimer();

    return () => {
      io.disconnect();
      window.clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer();
  };

  const markFailed = (idx) => {
    setImgFailed((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  return (
    <div className="hero-carousel" ref={rootRef} aria-label="KritiQ highlights">
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide ${idx === current ? "hero-slide--active" : ""}`}
          aria-hidden={idx !== current}
        >
          {!imgFailed[idx] ? (
            <div className="hero-slide__img-container">
              <Image
                src={slide.img}
                alt=""
                fill
                priority={idx === 0}
                className="hero-slide__img"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => markFailed(idx)}
              />
            </div>
          ) : (
            <div
              className="hero-slide__gradient"
              style={{ background: slide.gradient }}
            />
          )}

          <div className="hero-slide__scrim" />

          <div className="hero-slide__copy">
            <p className="hero-slide__sub">{slide.sub}</p>
            <h2 className="hero-slide__label">{slide.label}</h2>
          </div>
        </div>
      ))}

      <div className="hero-brand">
        <span className="hero-brand__name">KritiQ</span>
        <span className="hero-brand__tagline">
          Nigeria&apos;s pulse on film &amp; music
        </span>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Slide indicators">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Slide ${idx + 1}`}
            className={`hero-dot ${idx === current ? "hero-dot--active" : ""}`}
            onClick={() => goTo(idx)}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-carousel {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #050505;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-slide--active {
          opacity: 1;
        }
        .hero-slide__img-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        :global(.hero-slide__img) {
          object-fit: cover !important;
          object-position: center top !important;
        }
        .hero-slide__gradient {
          position: absolute;
          inset: 0;
        }
        .hero-slide__scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(5, 5, 5, 0.92) 0%,
              rgba(5, 5, 5, 0.35) 45%,
              rgba(5, 5, 5, 0.18) 100%
            ),
            linear-gradient(to right, rgba(5, 5, 5, 0.45) 0%, transparent 60%);
        }
        .hero-slide__copy {
          position: absolute;
          bottom: 72px;
          left: 28px;
          right: 28px;
        }
        .hero-slide__sub {
          font-family: "Lexend", sans-serif;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .hero-slide__label {
          font-family: "Clash Grotesk", sans-serif;
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
        }
        .hero-brand {
          position: absolute;
          top: 28px;
          left: 28px;
          z-index: 10;
        }
        .hero-brand__name {
          display: block;
          font-family: "Clash Grotesk", sans-serif;
          font-weight: 700;
          font-size: 1.6rem;
          background: linear-gradient(135deg, #e8001f, #ff4433);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-brand__tagline {
          font-family: "Lexend", sans-serif;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .hero-dots {
          position: absolute;
          bottom: 28px;
          left: 28px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }
        .hero-dot {
          width: 20px;
          height: 3px;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.25);
          transition: all 0.3s;
        }
        .hero-dot--active {
          background: #c0001a;
          width: 32px;
        }
      `}</style>
    </div>
  );
}
