"use client";

// client/components/dashboard/MovieSelector.js
// Sidebar list of creator's movies — click to switch the dashboard view.

import { Film, Music } from "lucide-react";
import Image from "next/image";

export default function MovieSelector({ movies = [], selectedId, onSelect }) {
  if (!movies.length) {
    return (
      <div className="selector-card empty">
        <Film size={24} style={{ color: "var(--color-kritiq-ash)" }} />
        <p>No titles registered yet.</p>
        <a
          href="/pro/submit"
          className="btn-primary"
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          Register a Title
        </a>
      </div>
    );
  }

  return (
    <div className="selector-card">
      <p className="selector-label">Your Titles</p>
      <ul className="selector-list">
        {movies.map((movie) => {
          const isSelected = movie.id === selectedId;
          const isMusic = movie.category === "music";

          return (
            <li key={movie.id}>
              <button
                onClick={() => onSelect(movie.id)}
                className={`selector-item ${isSelected ? "selected" : ""}`}
              >
                {/* Poster thumbnail */}
                <div className="selector-thumb">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={32}
                      height={44}
                      className="object-cover w-full h-full"
                      // Preload the first few thumbnails for better performance
                      priority={movies.indexOf(movie) < 4}
                    />
                  ) : isMusic ? (
                    <Music size={14} className="text-kritiq-ash" />
                  ) : (
                    <Film size={14} className="text-kritiq-ash" />
                  )}
                </div>

                {/* Info */}
                <div className="selector-info">
                  <span className="selector-title">{movie.title}</span>
                  <span className="selector-meta">
                    🔥 {movie.hype_score?.toFixed(0) || 0}% ·{" "}
                    {movie.status?.replace("_", " ")}
                  </span>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div
                    style={{
                      width: "3px",
                      height: "100%",
                      background: "var(--color-kritiq-red)",
                      borderRadius: "2px",
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .selector-card {
          background: var(--color-kritiq-dark-1);
          border: 1px solid var(--color-kritiq-dark-3);
          border-radius: var(--radius-card);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .selector-card.empty {
          align-items: center;
          justify-content: center;
          min-height: 160px;
          text-align: center;
          gap: 12px;
        }
        .selector-card.empty p {
          font-family: var(--font-gilroy);
          font-size: 13px;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
        .selector-label {
          font-family: var(--font-lexend);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
        }
        .selector-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .selector-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 8px 10px 14px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .selector-item:hover {
          background: var(--color-kritiq-dark-2);
        }
        .selector-item.selected {
          background: rgba(192, 0, 26, 0.08);
        }
        .selector-thumb {
          width: 32px;
          height: 44px;
          border-radius: 4px;
          background: var(--color-kritiq-dark-3);
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .selector-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .selector-title {
          font-family: var(--font-gilroy);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .selector-meta {
          font-family: var(--font-gilroy);
          font-size: 11px;
          color: var(--color-kritiq-ash);
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
