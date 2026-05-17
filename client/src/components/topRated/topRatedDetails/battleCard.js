// client/src/components/topRated/topRatedDetails/battleCard.js

"use client";

/**
 * BattleCard
 * The hero face-off component for the Arena section.
 *
 * Mount animation sequence (CSS only, no libraries):
 *   ① Covers fade + slide up (0ms / 200ms stagger)
 *   ② Vote bar fills from 0% (400ms ease-out)
 *   ③ City pulse fades in (600ms)
 *   ④ Countdown appears (800ms)
 *
 * Low bandwidth: images lazy-loaded with next/image sizes prop.
 * No audio, no video, no external fonts beyond what the app already loads.
 *
 * Accessibility: vote buttons announce selected state, live region
 * for vote count updates.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Clock } from "lucide-react";
import { useBattleVote } from "../../../utils/hooks/useArena";
import useAuthStore from "../../../sessions/userSessions";
import AuthGate from "../../auth/authGate";
import CityPulseStrip from "./cityPulseStrip";
import { getPosterUrl } from "../../../services/cloudinary/upload/urlBuilders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(endsAt) {
  const diff = new Date(endsAt) - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function getPct(votes, total) {
  if (!total) return 50;
  return Math.round((votes / total) * 100);
}

// ─── Cover side ───────────────────────────────────────────────────────────────

function ContentSide({
  title,
  slug,
  image,
  genre,
  hype,
  pct,
  side,
  contentType,
  userVote,
  onVote,
  isPending,
  mounted,
}) {
  const isVoted = userVote === side;
  const slugPath =
    contentType === "movie" ? `/movies/${slug}` : `/music/${slug}`;

  return (
    <div
      className={`cs-root ${mounted ? "cs-root--in" : ""} ${side === "b" ? "cs-root--b" : ""}`}
    >
      {/* Cover */}
      <Link
        href={slugPath}
        className="cs-cover-link"
        tabIndex={-1}
        aria-label={`View ${title}`}
      >
        <div className="cs-cover">
          {image ? (
            <Image
              src={getPosterUrl(image, { width: 200, height: 300 }).src}
              alt={title}
              fill
              sizes="(max-width: 640px) 40vw, 200px"
              className="cs-img"
              loading="lazy"
            />
          ) : (
            <div className="cs-cover-fallback" aria-hidden="true">
              🎬
            </div>
          )}
          <div className="cs-gradient" aria-hidden="true" />
          {genre && <span className="cs-genre">{genre}</span>}
        </div>
      </Link>

      {/* Meta */}
      <Link href={slugPath} className="cs-title-link">
        <p className="cs-title">{title}</p>
      </Link>

      {/* Hype score */}
      <div className="cs-hype" aria-label={`Hype score ${Math.round(hype)}`}>
        <Flame size={11} strokeWidth={2.5} aria-hidden="true" />
        <span>{Math.round(hype)}</span>
      </div>

      {/* Vote button */}
      <button
        className={`cs-vote-btn ${isVoted ? "cs-vote-btn--voted" : ""}`}
        onClick={() => onVote(side)}
        disabled={isPending}
        aria-pressed={isVoted}
        aria-label={isVoted ? `Unvote ${title}` : `Vote for ${title}`}
      >
        {isVoted ? "✓ Voted" : "Vote"}
        <span className="cs-vote-pct" aria-live="polite" aria-atomic="true">
          {pct}%
        </span>
      </button>

      <style jsx>{`
        .cs-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
          /* Entrance animation — GPU composited */
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 300ms ease,
            transform 300ms ease;
        }
        .cs-root--in {
          opacity: 1;
          transform: translateY(0);
        }
        .cs-root--b {
          transition-delay: 150ms;
        }

        .cs-cover-link {
          display: block;
          text-decoration: none;
        }
        .cs-cover {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .cs-img {
          object-fit: cover;
          transition: transform 300ms ease;
        }
        .cs-cover:hover .cs-img {
          transform: scale(1.03);
        }
        .cs-cover-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          background: var(--color-kritiq-dark-2, #1a1a1a);
        }
        .cs-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.6) 100%
          );
        }
        .cs-genre {
          position: absolute;
          bottom: 8px;
          left: 8px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f59e0b;
          background: rgba(0, 0, 0, 0.55);
          padding: 2px 7px;
          border-radius: 99px;
        }

        .cs-title-link {
          text-decoration: none;
        }
        .cs-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-kritiq-white, #fff);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }
        .cs-title-link:hover .cs-title {
          color: var(--color-kritiq-red, #c0001a);
        }

        .cs-hype {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 700;
          color: #f59e0b;
        }

        .cs-vote-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: var(--radius-pill, 99px);
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
          -webkit-tap-highlight-color: transparent;
          width: 100%;
        }
        .cs-vote-btn:hover:not(:disabled) {
          border-color: var(--color-kritiq-red, #c0001a);
          color: var(--color-kritiq-white, #fff);
        }
        .cs-vote-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .cs-vote-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .cs-vote-btn--voted {
          background: rgba(192, 0, 26, 0.1);
          border-color: var(--color-kritiq-red, #c0001a);
          color: var(--color-kritiq-red, #c0001a);
        }
        .cs-vote-pct {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-kritiq-ash, #666);
        }
        .cs-vote-btn--voted .cs-vote-pct {
          color: var(--color-kritiq-red, #c0001a);
        }
      `}</style>
    </div>
  );
}

// ─── Vote bar ─────────────────────────────────────────────────────────────────

function VoteBar({ pctA, pctB, totalVotes, animate }) {
  return (
    <div className="vb-root">
      <div
        className="vb-bar"
        role="meter"
        aria-valuenow={pctA}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pctA}% vs ${pctB}%`}
      >
        <div
          className="vb-fill vb-fill--a"
          style={{ width: animate ? `${pctA}%` : "0%" }}
        />
        <div
          className="vb-fill vb-fill--b"
          style={{ width: animate ? `${pctB}%` : "0%" }}
        />
      </div>
      <div className="vb-meta">
        <span className="vb-pct vb-pct--a">{pctA}%</span>
        <span className="vb-votes" aria-live="polite" aria-atomic="true">
          {totalVotes.toLocaleString()} votes
        </span>
        <span className="vb-pct vb-pct--b">{pctB}%</span>
      </div>

      <style jsx>{`
        .vb-root {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .vb-bar {
          height: 8px;
          border-radius: 99px;
          overflow: hidden;
          background: var(--color-kritiq-dark-3, #1e1e1e);
          display: flex;
        }
        .vb-fill {
          height: 100%;
          will-change: width;
          transition: width 700ms cubic-bezier(0.34, 1.1, 0.64, 1);
        }
        .vb-fill--a {
          background: var(--color-kritiq-red, #c0001a);
          border-radius: 99px 0 0 99px;
        }
        .vb-fill--b {
          background: #f59e0b;
          border-radius: 0 99px 99px 0;
        }
        .vb-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vb-pct {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
        }
        .vb-pct--a {
          color: var(--color-kritiq-red, #c0001a);
        }
        .vb-pct--b {
          color: #f59e0b;
        }
        .vb-votes {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #666);
        }
      `}</style>
    </div>
  );
}

// ─── Main BattleCard ──────────────────────────────────────────────────────────

export default function BattleCard({ battle }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const vote = useBattleVote();
  const [authOpen, setAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [barAnimate, setBarAnimate] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(battle.ends_at),
  );
  const barRef = useRef(null);

  // Stagger mount animation on first render
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t1);
  }, []);

  // Bar fills when scrolled into view
  useEffect(() => {
    if (!barRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBarAnimate(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  // Countdown ticker — 1 second interval
  useEffect(() => {
    const id = setInterval(
      () => setCountdown(formatCountdown(battle.ends_at)),
      1000,
    );
    return () => clearInterval(id);
  }, [battle.ends_at]);

  const totalVotes = battle.votes_a + battle.votes_b;
  const pctA = getPct(battle.votes_a, totalVotes);
  const pctB = 100 - pctA;
  const userVote = battle.user_vote ?? null;

  function handleVote(side) {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    vote.mutate({ battleId: battle.id, side });
  }

  return (
    <>
      <article
        className="bc-root"
        aria-label={`Battle: ${battle.content_a_title} vs ${battle.content_b_title}`}
      >
        {/* Countdown */}
        <div className={`bc-countdown ${mounted ? "bc-countdown--in" : ""}`}>
          <Clock size={11} strokeWidth={2.5} aria-hidden="true" />
          <time dateTime={battle.ends_at}>{countdown}</time>
        </div>

        {/* Content type badge */}
        <span className="bc-type-badge">
          {battle.content_type === "movie" ? "🎬 Movies" : "🎵 Music"}
        </span>

        {/* Two sides */}
        <div className="bc-sides">
          <ContentSide
            title={battle.content_a_title}
            slug={battle.content_a_slug}
            image={battle.content_a_image}
            genre={battle.content_a_genre}
            hype={battle.content_a_hype}
            votes={battle.votes_a}
            pct={pctA}
            side="a"
            contentType={battle.content_type}
            userVote={userVote}
            onVote={handleVote}
            isPending={vote.isPending}
            mounted={mounted}
          />

          <div className="bc-vs" aria-hidden="true">
            VS
          </div>

          <ContentSide
            title={battle.content_b_title}
            slug={battle.content_b_slug}
            image={battle.content_b_image}
            genre={battle.content_b_genre}
            hype={battle.content_b_hype}
            votes={battle.votes_b}
            pct={pctB}
            side="b"
            contentType={battle.content_type}
            userVote={userVote}
            onVote={handleVote}
            isPending={vote.isPending}
            mounted={mounted}
          />
        </div>

        {/* Vote bar */}
        <div ref={barRef}>
          <VoteBar
            pctA={pctA}
            pctB={pctB}
            totalVotes={totalVotes}
            animate={barAnimate}
          />
        </div>

        {/* City pulse */}
        <CityPulseStrip cityPulse={battle.city_pulse} />
      </article>

      <AuthGate
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        message="Sign in to vote in the Arena."
      />

      <style jsx>{`
        .bc-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          background: var(--color-kritiq-dark-1, #111);
          border: 0.5px solid var(--color-kritiq-dark-3, #1e1e1e);
          border-radius: 16px;
        }

        .bc-countdown {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 600;
          color: var(--color-kritiq-ash, #666);
          opacity: 0;
          transition: opacity 300ms ease 800ms;
        }
        .bc-countdown--in {
          opacity: 1;
        }

        .bc-type-badge {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--color-kritiq-red, #c0001a);
        }

        .bc-sides {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: start;
          gap: 8px;
        }

        .bc-vs {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 800;
          color: var(--color-kritiq-ash, #444);
          letter-spacing: 0.05em;
          padding-top: 40%;
          text-align: center;
        }

        @media (min-width: 640px) {
          .bc-root {
            padding: 20px;
            gap: 16px;
          }
          .bc-sides {
            gap: 16px;
          }
        }
      `}</style>
    </>
  );
}
