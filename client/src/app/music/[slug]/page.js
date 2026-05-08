// client/src/app/music/[slug]/page.js
"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Music2,
  Clock,
  Flame,
  Star,
  Globe,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { useMusicTrack } from "../../../utils/hooks/useMusic";
import MusicSnippetPlayer from "../../../components/music/musicUI/musicSnippetPlayer";
import MusicVoting from "../../../components/music/musicDetails/musicVoting";
import StreamingLinks from "../../../components/music/musicDetails/streamingLinks";
import { MusicDetailSkeleton } from "../../../components/music/musicDetails/musicSkeletons";
import { Instagram, XIcon } from "../../../components/common/icons/socialIcons";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Street Verdict bar ───────────────────────────────────────────────────────

function StreetVerdict({ track }) {
  const total = track.total_hype_votes ?? 0;
  // We approximate breakdown from hype_score: high score = more hype
  // In production replace with real hype/meh/flop counts from backend
  const hypeScore = track.hype_score ?? 0;
  const hypePct = Math.min(Math.round(hypeScore), 100);
  const mehPct = Math.round((100 - hypePct) * 0.5);
  const flopPct = 100 - hypePct - mehPct;

  return (
    <div className="sv-root">
      <div className="sv-header">
        <p className="sv-title">Street Verdict</p>
        <span className="sv-votes">{total.toLocaleString()} votes</span>
      </div>

      {/* Stacked bar */}
      <div className="sv-bar-wrap">
        <div className="sv-bar">
          <div
            className="sv-seg sv-seg--hype"
            style={{ width: `${hypePct}%` }}
            title={`Hype ${hypePct}%`}
          />
          <div
            className="sv-seg sv-seg--meh"
            style={{ width: `${mehPct}%` }}
            title={`Meh ${mehPct}%`}
          />
          <div
            className="sv-seg sv-seg--flop"
            style={{ width: `${flopPct}%` }}
            title={`Flop ${flopPct}%`}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="sv-legend">
        <span className="sv-leg sv-leg--hype">🔥 Hype {hypePct}%</span>
        <span className="sv-leg sv-leg--meh">😑 Meh {mehPct}%</span>
        <span className="sv-leg sv-leg--flop">📉 Flop {flopPct}%</span>
      </div>

      <style jsx>{`
        .sv-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sv-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
        .sv-votes {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #888);
        }
        .sv-bar-wrap {
          height: 8px;
          border-radius: 99px;
          overflow: hidden;
          background: var(--color-kritiq-dark-3, #2a2a2a);
        }
        .sv-bar {
          height: 100%;
          display: flex;
          border-radius: 99px;
          overflow: hidden;
        }
        .sv-seg {
          height: 100%;
          transition: width 600ms ease;
        }
        .sv-seg--hype {
          background: #f59e0b;
        }
        .sv-seg--meh {
          background: #555;
        }
        .sv-seg--flop {
          background: #ef4444;
        }
        .sv-legend {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .sv-leg {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          font-weight: 600;
        }
        .sv-leg--hype {
          color: #f59e0b;
        }
        .sv-leg--meh {
          color: #888;
        }
        .sv-leg--flop {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// ─── Artist social links ──────────────────────────────────────────────────────

function ArtistLinks({ track }) {
  // Expects track.social_links: { instagram, twitter, website, management_email }
  const links = track.social_links ?? {};
  const has = Object.values(links).some(Boolean);
  if (!has) return null;

  return (
    <div className="al-root">
      <p className="al-label">Artist Links</p>
      <div className="al-row">
        {links.Instagram && (
          <a
            href={links.Instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="al-btn al-btn--ig"
            aria-label="Instagram"
          >
            <Instagram size={16} strokeWidth={2} />
          </a>
        )}
        {links.X && (
          <a
            href={links.X}
            target="_blank"
            rel="noopener noreferrer"
            className="al-btn al-btn--tw"
            aria-label="Twitter / X"
          >
            <XIcon size={16} strokeWidth={2} />
          </a>
        )}
        {links.website && (
          <a
            href={links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="al-btn al-btn--web"
            aria-label="Website"
          >
            <Globe size={16} strokeWidth={2} />
          </a>
        )}
        {links.management_email && (
          <a
            href={`mailto:${links.management_email}`}
            className="al-btn al-btn--mail"
            aria-label="Management contact"
          >
            <Mail size={16} strokeWidth={2} />
          </a>
        )}
      </div>
      <style jsx>{`
        .al-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .al-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0;
        }
        .al-row {
          display: flex;
          gap: 10px;
        }
        .al-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--color-kritiq-dark-3, #2a2a2a);
          background: var(--color-kritiq-dark-1, #111);
          color: var(--color-kritiq-ash, #888);
          text-decoration: none;
          transition: all 150ms ease;
        }
        .al-btn:hover {
          color: #fff;
          border-color: #555;
        }
        .al-btn--ig:hover {
          color: #e1306c;
          border-color: #e1306c;
        }
        .al-btn--tw:hover {
          color: #1da1f2;
          border-color: #1da1f2;
        }
        .al-btn--web:hover {
          color: #f59e0b;
          border-color: #f59e0b;
        }
        .al-btn--mail:hover {
          color: #22c55e;
          border-color: #22c55e;
        }
      `}</style>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MusicSlugPage({ params }) {
  const { slug } = use(params);
  const { data: track, isLoading, isError } = useMusicTrack(slug);

  if (isLoading) return <MusicDetailSkeleton />;

  if (isError || !track) {
    return (
      <main className="msp-error">
        <p>Track not found.</p>
        <Link href="/music" className="msp-back">
          ← Back to Music
        </Link>
        <style jsx>{`
          .msp-error {
            padding: 48px 16px;
            text-align: center;
            font-family: var(--font-lexend, sans-serif);
            color: var(--color-kritiq-ash, #888);
          }
          .msp-back {
            display: inline-block;
            margin-top: 12px;
            font-size: 13px;
            color: var(--color-kritiq-red, #c0001a);
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  const isPreRelease = track.status === "pre_release";
  const engagement = track.user_engagement ?? {};

  return (
    <main className="msp-root">
      {/* Back nav */}
      <div className="msp-nav">
        <Link href="/music" className="msp-back-btn">
          <ChevronLeft size={16} strokeWidth={2.5} />
          Music
        </Link>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="msp-hero">
        <div className="msp-cover-wrap">
          {track.cover_url ? (
            <Image
              src={track.cover_url}
              alt={`${track.title} cover art`}
              fill
              sizes="(max-width: 768px) 80vw, 300px"
              className="msp-cover-img"
              priority
            />
          ) : (
            <div className="msp-cover-fallback">
              <Music2 size={48} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="msp-meta">
          {/* Status + genre */}
          <div className="msp-tags">
            <span
              className={`msp-status ${isPreRelease ? "msp-status--pre" : "msp-status--out"}`}
            >
              {isPreRelease ? (
                <>
                  <Clock size={10} strokeWidth={2.5} />
                  {track.days_until_release != null &&
                  track.days_until_release > 0
                    ? `Drops in ${track.days_until_release}d`
                    : "Pre-Release"}
                </>
              ) : (
                "Out Now"
              )}
            </span>
            {track.genre && <span className="msp-genre">{track.genre}</span>}
          </div>

          <h1 className="msp-title">{track.title}</h1>
          <p className="msp-artist">{track.artist}</p>
          {track.label && <p className="msp-label-name">{track.label}</p>}
          {track.release_date && (
            <p className="msp-date">{formatDate(track.release_date)}</p>
          )}

          {/* Scores row */}
          <div className="msp-scores">
            <div className="msp-score">
              <Flame size={14} strokeWidth={2} style={{ color: "#f59e0b" }} />
              <span className="msp-score-val">
                {Math.round(track.hype_score ?? 0)}
              </span>
              <span className="msp-score-lbl">Hype</span>
            </div>
            <div className="msp-score-divider" />
            <div className="msp-score">
              <Star size={14} strokeWidth={2} style={{ color: "#f59e0b" }} />
              <span className="msp-score-val">
                {(track.rating_score ?? 0).toFixed(1)}
              </span>
              <span className="msp-score-lbl">Rating</span>
            </div>
            <div className="msp-score-divider" />
            <div className="msp-score">
              <span className="msp-score-val">
                {(track.total_views ?? 0).toLocaleString()}
              </span>
              <span className="msp-score-lbl">Views</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Snippet player ─────────────────────────────────────────────── */}
      {track.preview_url && (
        <section className="msp-section">
          <MusicSnippetPlayer
            previewUrl={track.preview_url}
            trackId={track.id}
          />
          <p className="msp-player-note">
            30s preview ·{" "}
            {isPreRelease ? "Pre-release snippet" : "Rate after listening"}
          </p>
        </section>
      )}

      {/* ── Street Verdict ─────────────────────────────────────────────── */}
      <section className="msp-section">
        <StreetVerdict track={track} />
      </section>

      {/* Divider */}
      <div className="msp-divider" />

      {/* ── Voting ──────────────────────────────────────────────────────── */}
      <section className="msp-section">
        <MusicVoting track={track} engagement={engagement} />
      </section>

      <div className="msp-divider" />

      {/* ── Streaming links ─────────────────────────────────────────────── */}
      <section className="msp-section">
        <StreamingLinks links={track.streaming_links ?? {}} />
      </section>

      {/* ── Artist links ─────────────────────────────────────────────────── */}
      <section className="msp-section">
        <ArtistLinks track={track} />
      </section>

      {/* ── Description ──────────────────────────────────────────────────── */}
      {track.description && (
        <section className="msp-section">
          <p className="msp-desc-label">About</p>
          <p className="msp-desc">{track.description}</p>
        </section>
      )}

      <style jsx>{`
        .msp-root {
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 100vh;
          background: var(--color-kritiq-black, #0a0a0a);
          padding-bottom: 48px;
        }

        /* Nav */
        .msp-nav {
          padding: 12px 16px 0;
        }
        .msp-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-kritiq-ash, #888);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .msp-back-btn:hover {
          color: var(--color-kritiq-white, #fff);
        }

        /* Hero */
        .msp-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px 16px 24px;
        }

        .msp-cover-wrap {
          position: relative;
          width: min(260px, 80vw);
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: var(--color-kritiq-dark-2, #1a1a1a);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
          flex-shrink: 0;
        }
        .msp-cover-img {
          object-fit: cover;
        }
        .msp-cover-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-kritiq-ash, #666);
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
        }

        .msp-meta {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: center;
          align-items: center;
        }

        .msp-tags {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .msp-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 99px;
        }
        .msp-status--pre {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        .msp-status--out {
          background: rgba(192, 0, 26, 0.1);
          color: var(--color-kritiq-red, #c0001a);
          border: 1px solid rgba(192, 0, 26, 0.2);
        }

        .msp-genre {
          font-family: var(--font-lexend, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #f59e0b;
        }

        .msp-title {
          font-family: var(--font-lexend, sans-serif);
          font-size: 26px;
          font-weight: 800;
          color: var(--color-kritiq-white, #fff);
          margin: 4px 0 0;
          line-height: 1.15;
          text-align: center;
        }

        .msp-artist {
          font-family: var(--font-lexend, sans-serif);
          font-size: 15px;
          font-weight: 500;
          color: var(--color-kritiq-silver, #bbb);
          margin: 0;
        }

        .msp-label-name,
        .msp-date {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          color: var(--color-kritiq-ash, #777);
          margin: 0;
        }

        .msp-scores {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
        }
        .msp-score {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .msp-score-val {
          font-family: var(--font-lexend, sans-serif);
          font-size: 15px;
          font-weight: 700;
          color: var(--color-kritiq-white, #fff);
        }
        .msp-score-lbl {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #888);
        }
        .msp-score-divider {
          width: 1px;
          height: 18px;
          background: var(--color-kritiq-dark-3, #2a2a2a);
        }

        /* Sections */
        .msp-section {
          padding: 0 16px;
          margin-top: 20px;
        }

        .msp-player-note {
          font-family: var(--font-lexend, sans-serif);
          font-size: 11px;
          color: var(--color-kritiq-ash, #777);
          margin: 6px 0 0;
          text-align: center;
        }

        .msp-divider {
          height: 1px;
          background: var(--color-kritiq-dark-3, #1e1e1e);
          margin: 20px 16px 0;
        }

        .msp-desc-label {
          font-family: var(--font-lexend, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-kritiq-ash, #888);
          margin: 0 0 8px;
        }
        .msp-desc {
          font-family: var(--font-lexend, sans-serif);
          font-size: 14px;
          color: var(--color-kritiq-silver, #aaa);
          line-height: 1.7;
          margin: 0;
        }
      `}</style>
    </main>
  );
}
