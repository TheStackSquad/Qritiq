// client/src/components/musicUI/musicGenreRow.js

"use client";

import Link from "next/link";
import MusicCard from "./musicCard";
import { ArrowRight } from "lucide-react";

export default function MusicGenreRow({ genre, tracks = [], emoji = "🎵" }) {
  if (!tracks.length) return null;

  return (
    <section className="mgr-root">
      {/* Section header */}
      <div className="mgr-header">
        <h2 className="mgr-title">
          <span className="mgr-emoji">{emoji}</span>
          {genre}
        </h2>
        <Link
          href={`/music?genre=${encodeURIComponent(genre)}`}
          className="mgr-see-all"
        >
          See all <ArrowRight size={13} strokeWidth={2} />
        </Link>
      </div>

      {/* Horizontal scroll row */}
      <div className="mgr-scroll">
        {tracks.map((track) => (
          <div key={track.id} className="mgr-item">
            <MusicCard track={track} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .mgr-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mgr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        .mgr-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--color-kritiq-white, #fff);
          margin: 0;
        }

        .mgr-emoji {
          font-size: 16px;
        }

        .mgr-see-all {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-red, #c0001a);
          text-decoration: none;
          transition: opacity 150ms ease;
        }
        .mgr-see-all:hover {
          opacity: 0.75;
        }

        .mgr-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 0 16px 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .mgr-scroll::-webkit-scrollbar {
          display: none;
        }

        .mgr-item {
          flex-shrink: 0;
          width: 148px;
          scroll-snap-align: start;
        }

        @media (min-width: 640px) {
          .mgr-item {
            width: 180px;
          }
        }
      `}</style>
    </section>
  );
}
