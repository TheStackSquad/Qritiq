// client/src/components/topRated/topRatedDetails/battleHistory.js

"use client";


/**
 * BattleHistory
 * Displays completed battles as compact result cards.
 * Winner side is highlighted. City pulse is omitted for brevity.
 * Scroll-triggered cascade animation via IntersectionObserver.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

// Sub-component defined outside to prevent re-creation during render
function Side({ side, title, image, pct, winner }) {
  const isWinner = winner === side;
  return (
    <div className={`hr-side ${isWinner ? "hr-side--winner" : ""}`}>
      <div className="hr-thumb">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="48px"
            className="hr-img"
            loading="lazy"
          />
        ) : (
          <div className="hr-thumb-fallback" aria-hidden="true">
            🎬
          </div>
        )}
      </div>
      <div className="hr-info">
        <p className="hr-title">{title}</p>
        <p className="hr-pct">{pct}%</p>
      </div>
      {isWinner && (
        <Trophy
          size={14}
          strokeWidth={2}
          className="hr-trophy"
          aria-label="Winner"
        />
      )}
    </div>
  );
}

function HistoryRow({ battle, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Trigger animation when row enters viewport
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const totalVotes = battle.votes_a + battle.votes_b;
  const pctA =
    totalVotes > 0 ? Math.round((battle.votes_a / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;
  const winner = battle.winner;

  return (
    <article
      ref={ref}
      className={`hr-root ${visible ? "hr-root--in" : ""}`}
      style={{ transitionDelay: `${index * 60}ms` }}
      aria-label={`Completed battle: ${battle.content_a_title} vs ${battle.content_b_title}`}
    >
      <Side
        side="a"
        title={battle.content_a_title}
        image={battle.content_a_image}
        pct={pctA}
        winner={winner}
      />

      <div className="hr-divider" aria-hidden="true">
        VS
      </div>

      <Side
        side="b"
        title={battle.content_b_title}
        image={battle.content_b_image}
        pct={pctB}
        winner={winner}
      />

      <p className="hr-total">{totalVotes.toLocaleString()} votes</p>

      <style jsx>{`
        .hr-root {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--color-kritiq-dark-1, #111);
          border: 0.5px solid var(--color-kritiq-dark-3, #1e1e1e);
          border-radius: 12px;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 280ms ease,
            transform 280ms ease;
        }
        .hr-root--in {
          opacity: 1;
          transform: translateY(0);
        }

        .hr-side {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
          position: relative;
        }
        .hr-side--winner .hr-title {
          color: var(--color-kritiq-white, #fff);
        }
        .hr-side--winner .hr-pct {
          color: #f59e0b;
          font-weight: 700;
        }

        .hr-thumb {
          position: relative;
          width: 40px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .hr-img {
          object-fit: cover;
        }
        .hr-thumb-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .hr-info {
          flex: 1;
          min-width: 0;
        }
        .hr-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 500;
          color: var(--color-kritiq-ash, #888);
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hr-pct {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #666);
          margin: 0;
          font-weight: 600;
        }

        .hr-trophy {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .hr-divider {
          font-family: var(--font-lexend, sans-serif);
          font-size: 9px;
          font-weight: 800;
          color: var(--color-kritiq-ash, #333);
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .hr-total {
          display: none;
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          color: var(--color-kritiq-ash, #555);
          white-space: nowrap;
          margin: 0;
          flex-shrink: 0;
        }

        @media (min-width: 400px) {
          .hr-total {
            display: block;
          }
        }
      `}</style>
    </article>
  );
}

export default function BattleHistory({ battles = [] }) {
  if (!battles.length) return null;

  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="bh-heading">
        Past Verdicts
      </h2>
      <div className="bh-list">
        {battles.map((battle, i) => (
          <HistoryRow key={battle.id} battle={battle} index={i} />
        ))}
      </div>

      <style jsx>{`
        .bh-heading {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #666);
          margin: 0 0 12px;
          padding: 0 16px;
        }
        .bh-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 16px;
        }
      `}</style>
    </section>
  );
}