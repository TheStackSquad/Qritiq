// src/components/movies/movieDetails/movieScores.js

"use client";
import { Flame, Star } from "lucide-react";

function ScoreCard({ icon: Icon, label, score, votes, color }) {
  const hasData = score != null && (score > 0 || (votes != null && votes > 0));
  if (!hasData) return null;

  return (
    <div className="score-card" role="group" aria-label={label}>
      <div className="score-header">
        <Icon size={18} fill={color} style={{ color }} aria-hidden="true" />
        <span className="score-value" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="score-info">
        <p className="score-label">{label}</p>
        {votes > 0 && (
          <p className="score-votes">{votes.toLocaleString()} votes</p>
        )}
      </div>
      <style jsx>{`
        .score-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }
        .score-value {
          font-family: var(--font-clash);
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1;
        }
        .score-label {
          font-size: 10px;
          text-transform: uppercase;
          color: var(--color-kritiq-ash);
          margin: 0;
          letter-spacing: 0.05em;
        }
        .score-votes {
          font-size: 9px;
          color: var(--color-kritiq-ash);
          opacity: 0.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default function MovieScores({ movie }) {
  const hypeScore = parseFloat(movie.hype_score ?? 0);
  const ratingScore = parseFloat(movie.rating_score ?? 0);

  if (!hypeScore && !ratingScore) return null;

  return (
    <div className="scores-container">
      <ScoreCard
        icon={Flame}
        label="Hype"
        score={hypeScore}
        votes={movie.total_hype_votes}
        color="var(--color-hype)"
      />
      <ScoreCard
        icon={Star}
        label="Rating"
        score={ratingScore}
        votes={movie.total_ratings}
        color="#F59E0B"
      />

      <style jsx>{`
        .scores-container {
          display: flex;
          gap: 12px;
          padding: 16px;
        }
        @media (max-width: 350px) {
          .scores-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}